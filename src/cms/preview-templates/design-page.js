import { shape, string } from 'prop-types';
import React from 'react';
import * as uuid from 'uuid';
import { ImageSrcPropType } from '../../components/page-layout/image/image.component';
import Footer from '../../components/page-layout/footer/footer.component';
import Header from '../../components/page-layout/header/header.component';
import PageComponent from '../../components/page-components/page-component';

export default DesignPagePreview;

DesignPagePreview.propTypes = {
    entry: shape({
        data: shape({
            title: string.isRequired,
            text: string,
            image: ImageSrcPropType,
        }),
    }).isRequired,
};

function DesignPagePreview({ entry }) {
    const { data } = entry.toJS();
    const { components, ...header } = data;

    !!components &&
        components.forEach(component => {
            const { articles } = component;
            component.id = uuid.v1();

            !!articles &&
                articles.forEach(article => {
                    article.id = uuid.v1();
                });
        });

    const companyInfo = {};
    const headerProps = {
        ...header,
        menu: [],
        companyInfo,
    };

    return (
        <>
            <Header {...headerProps} />
            <main>{!!components && components.map(component => <PageComponent key={uuid.v1()} {...component} />)}</main>
            <Footer {...{ companyInfo }} />
        </>
    );
}
