import React from 'react';
import { createComponent, i18n } from 'webiny-app';

const t = i18n.namespace("Webiny.Skeleton.Auth.Forbidden");

class Forbidden extends React.Component {
    render() {
        const {Icon, View} = this.props;
        return (
            <View.List>
                <View.Body>
                    <h3><Icon icon="icon-cancel"/>{t`Access Forbidden`}</h3>

                    <p>
                        {t`Unfortunately, you are not allowed to see this page.`}<br/>
                        {t`If you think this is a mistake, please contact your system administrator.`}
                    </p>
                </View.Body>
            </View.List>
        );
    }
}

export default createComponent(Forbidden, {modules: ['Icon', 'View']});