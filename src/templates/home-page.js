import { graphql } from 'gatsby';
import React            from 'react';
import HomepageTemplate from '../components/page-templates/homepage/homepage.template';
import Layout           from '../components/page-layout/layout';

const homepagePropTypes = {
    data: [],
};

export default Homepage;

Homepage.propTypes = homepagePropTypes;
Homepage.defaultProps = {
    data: [],
};

function Homepage({ data }) {
    const props = {
        title: 'Forward thinking software',
        image: '/uploads/curlyhair.png',
    };
    return (
        <Layout {...props}>
            <HomepageTemplate {...data} />
        </Layout>
    );
}

export const query = graphql`
    query HomePageQuery {
        page: dataJson {
            sections {
                image
                imageSquare: image
                isPostit
                title
                isRightImage
                components {
                    type
                    quote
                    profilePic
                    name
                    jobTitle
                    text
                    title
                }
            }
        }
    }
`;
