import { shape, string } from 'prop-types';
import React from 'react';

import Markdown from '../page-layout/markdown';
import styles from './content.module.scss';
import Quote from './quote/quote.component';

const contentComponentPropTypes = {
    type: string.isRequired,
};

export default ContentComponent;
export const ContentComponentProps = shape(contentComponentPropTypes);

ContentComponent.propTypes = contentComponentPropTypes;

function ContentComponent({ type, ...item }) {
    const { text } = item || {};

    switch (type) {
        case 'quote-component':
            return <Quote {...item} fullWidth />;
        case 'markdown-component':
            return <Markdown className={styles.markdown} source={text} />;
        default:
            return null;
    }
}
