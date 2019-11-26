import React from 'react';
import Link from '../link/link.component';
import styles from './footer.module.scss';
import Socials from '../socials/socials.component';
import { CompanyInfoPropType } from '../company-info.prop-type';

export default Footer;

Footer.propTypes = {
    companyInfo: CompanyInfoPropType.isRequired,
};
function Footer({ companyInfo, callToAction }) {
    const { companyName, email, address, phone } = companyInfo;
    const isFooter = true;
    const thisYear = new Date().getFullYear();
    return (
        <footer className={styles.footer}>
            <section className={styles.getInTouch}>
                <h1>
                    {callToAction}
                    <Link to="/get-in-touch">Get in touch</Link>
                </h1>
            </section>

            <Socials {...{ ...companyInfo, isFooter }} />

            <address>
                {(email || phone) && (
                    <section className={styles.contact}>
                        {!!email && <Link to={`mailto:${email}`}>{email}</Link>}
                        {!!phone && <Link to={`tel:${phone}`}>{phone}</Link>}
                    </section>
                )}
                <section>
                    <section className={styles.copyright}>
                        &copy; {thisYear} {companyName}
                    </section>
                    <section className={styles.address}>{address}</section>
                    <section className={styles.legal}>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
                    </section>
                </section>
            </address>
        </footer>
    );
}
