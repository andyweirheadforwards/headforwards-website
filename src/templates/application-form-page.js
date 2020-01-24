import { graphql } from 'gatsby';
import { shape, string } from 'prop-types';
import React from 'react';
import Layout from '../components/page-layout/layout';
import ApplicationFormTemplate from '../components/page-templates/application-form/application-form.template';

export default ApplicationFormPage;

ApplicationFormPage.propTypes = {
    data: shape({
        job: shape({
            title: string.isRequired,
        }),
    }).isRequired,
};

function ApplicationFormPage({ data }) {
    const { form } = data;
    const { title: subtitle, ...templateProps } = form;

    const headerProps = {
        title: 'Application Form',
        subtitle,
    };

    return (
        <Layout {...headerProps}>
            <ApplicationFormTemplate {...templateProps} />
        </Layout>
    );
}

export const query = graphql`
    query ApplicationFormPage($id: String!) {
        form: recruiteeOffer(id: { eq: $id }) {
            ...ApplicationFormFragment
        }
    }
`;