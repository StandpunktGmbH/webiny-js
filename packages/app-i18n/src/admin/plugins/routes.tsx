import React from "react";
import Helmet from "react-helmet";
import { Route } from "@webiny/react-router";
import { AdminLayout } from "@webiny/app-admin/components/AdminLayout";
import { I18NLocales } from "@webiny/app-i18n/admin/views/I18NLocales";
import { SecureRoute } from "@webiny/app-security/components";
import { RoutePlugin } from "@webiny/app/types";

const ROLE_I18N_LOCALES = ["i18n:locale:crud"];

const plugin: RoutePlugin = {
    name: "route-i18n-locales",
    type: "route",
    route: (
        <Route
            exact
            path={"/i18n/locales"}
            render={() => (
                <SecureRoute scopes={ROLE_I18N_LOCALES}>
                    <AdminLayout>
                        <Helmet title={"I18N - Locales"} />
                        <I18NLocales />
                    </AdminLayout>
                </SecureRoute>
            )}
        />
    )
};

export default plugin;
