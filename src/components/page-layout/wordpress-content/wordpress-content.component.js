import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import parseHtml from 'html-react-parser';
import styles from './wordpress-content.module.scss';

export default WordpressContent;

WordpressContent.propTypes = {
    content: PropTypes.string.isRequired,
};

function WordpressContent({ content }) {
    return (
        <Fragment>
            {(content && <section className={styles.content}>{parseHtml(cleanContent(content))}</section>) || ''}
        </Fragment>
    );
}

function cleanContent(content) {
    return content
        .replace(/^<html><head><\/head><body>([\s\S]*)<\/body><\/html>$/, '$1')
        .replace(/\s+/gm, ' ')
        .trim();
}
