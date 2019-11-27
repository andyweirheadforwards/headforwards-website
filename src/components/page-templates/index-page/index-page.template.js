import React from 'react';
import { string } from 'prop-types';
import Image from '../../page-layout/image/image.component';
import Link from '../../page-layout/link/link.component';
import styles from './index-page.module.scss';

const PageLinkPropTypes = {
    link: string,
    linkText: string,
    page: {},
};

PageLink.propTypes = PageLinkPropTypes;
PageLink.defaultProps = {
    link: '',
    linkText: '',
    page: {},
};

export default function IndexPageTemplate({ pages }) {
    return <section className={styles.pages}>{!!pages && pages.map(page => <PageLink {...page} />)}</section>;
}

function PageLink({ link, linkText, page }) {
    const { frontmatter } = page || {};
    const { image } = frontmatter || {};

    return (
        <Link to={link}>
            <article className={styles.page}>
                <h1>{linkText}</h1>
                {!!image && <Image image={image} alt={linkText} />}
            </article>
        </Link>
    );
}