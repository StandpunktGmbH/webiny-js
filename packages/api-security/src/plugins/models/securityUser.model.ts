import { pipe } from "@webiny/commodo";
import { validation } from "@webiny/validation";
import md5 from "md5";
import bcrypt from "bcryptjs";
import {
    withHooks,
    withProps,
    withName,
    string,
    withFields,
    onSet,
    ref,
    skipOnPopulate
} from "@webiny/commodo";

export default ({ createBase, context }): any => {
    // TODO: figure out how to create typings for a `model`
    const SecurityUser: any = pipe(
        withName("SecurityUser"),
        withHooks(),
        withFields(instance => ({
            email: onSet(value => {
                if (value === instance.email) {
                    return value;
                }

                value = value.toLowerCase().trim();
                const removeCallback = instance.hook("beforeSave", async () => {
                    removeCallback();
                    const existingUser = await SecurityUser.findOne({
                        query: { email: value }
                    });
                    if (existingUser) {
                        throw Error("User with given e-mail already exists.");
                    }
                });

                return value;
            })(
                string({
                    validation: validation.create("required")
                })
            ),
            password: onSet(value => {
                if (value) {
                    return bcrypt.hashSync(value, bcrypt.genSaltSync(10));
                }
                return instance.password;
            })(
                string({
                    validation: validation.create("required")
                })
            ),
            firstName: string(),
            lastName: string(),
            roles: ref({
                list: true,
                instanceOf: [context.models.SecurityRole, "model"],
                using: [context.models.SecurityRoles2Models, "role"]
            }),
            groups: ref({
                list: true,
                instanceOf: [context.models.SecurityGroup, "model"],
                using: [context.models.SecurityGroups2Models, "group"]
            }),
            avatar: context.commodo.fields.id(),
            personalAccessTokens: skipOnPopulate()(
                ref({
                    list: true,
                    instanceOf: [context.models.SecurityPersonalAccessToken, "user"]
                })
            )
        })),
        withProps(instance => ({
            __access: null,
            get fullName() {
                return `${instance.firstName} ${instance.lastName}`.trim();
            },
            get gravatar() {
                return "https://www.gravatar.com/avatar/" + md5(instance.email);
            },
            get access() {
                if (this.__access) {
                    return this.__access;
                }

                return new Promise(async resolve => {
                    const access = {
                        scopes: [],
                        roles: [],
                        fullAccess: false
                    };

                    const groups = await this.groups;
                    // Get scopes via `groups` relation
                    for (let i = 0; i < groups.length; i++) {
                        const group = groups[i];
                        const roles = await group.roles;
                        for (let j = 0; j < roles.length; j++) {
                            const role = roles[j];
                            !access.roles.includes(role.slug) && access.roles.push(role.slug);
                            role.scopes.forEach(scope => {
                                !access.scopes.includes(scope) && access.scopes.push(scope);
                            });
                        }
                    }

                    // Get scopes via `roles` relation
                    const roles = await this.roles;
                    for (let j = 0; j < roles.length; j++) {
                        const role = roles[j];
                        !access.roles.includes(role.slug) && access.roles.push(role.slug);
                        role.scopes.forEach(scope => {
                            !access.scopes.includes(scope) && access.scopes.push(scope);
                        });
                    }

                    // If full access, no need to send any scopes / roles.
                    access.fullAccess = access.roles.includes("full-access");
                    if (access.fullAccess) {
                        access.scopes = [];
                        access.roles = [];
                    }

                    this.__access = access;

                    resolve(access);
                });
            }
        }))
    )(createBase());

    return SecurityUser;
};
