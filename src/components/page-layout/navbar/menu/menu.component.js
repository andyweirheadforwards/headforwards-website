import { Location } from '@reach/router';
import React from 'react';

import Link from '../../link/link.component';
import Socials from '../../socials/socials.component';
import Hamburger from '../hamburger/hamburger.component';
import MenuItem from '../menu-item/menu-item.component';
import styles from '../navbar.module.scss';
import { menuPropTypes } from './menu.prop-type';

export default Menu;

Menu.propTypes = menuPropTypes;

Menu.defaultProps = {
    hasBackground: false,
    activeClass: null,
};

function Menu({ menuClick, hasBackground, activeClass, menu: fullMenu, companyInfo }) {
    const { companyName, phone } = companyInfo;
    const backgroundImg = hasBackground ? 'with-bg' : '';

    const [home, ...menu] = fullMenu;
    const { children: homeChildren } = home || {};

    return (
        <Location>
            {({ location }) => (
                <>
                    <nav className={`${activeClass} ${styles.menu} ${backgroundImg}`}>
                        <header>
                            <Link to="/">{companyName}</Link>
                            <Hamburger
                                {...{
                                    activeClass,
                                    onClick: menuClick,
                                }}
                            />
                        </header>
                        <section>
                            <ul>
                                <MenuItem
                                    className={styles.navHomeLink}
                                    {...home}
                                    {...{
                                        location,
                                        showTitle: true,
                                    }}
                                />
                                {menu.map(({ id, ...item }) => (
                                    <MenuItem
                                        key={id}
                                        {...item}
                                        {...{
                                            location,
                                            showTitle: true,
                                        }}
                                    />
                                ))}
                                {homeChildren &&
                                    homeChildren.map(({ id, ...item }) => (
                                        <MenuItem
                                            key={id}
                                            className={styles.navContactLink}
                                            {...item}
                                            {...{
                                                location,
                                                showTitle: true,
                                            }}
                                        />
                                    ))}
                            </ul>
                            <section className={styles.contactDetails}>
                                <dl>
                                    <dt>Call us.</dt>
                                    <dd>{phone}</dd>
                                </dl>
                                <section>
                                    <h2>Follow us.</h2>
                                    <Socials
                                        {...{
                                            ...companyInfo,
                                            activeClass,
                                        }}
                                    />
                                </section>
                            </section>
                        </section>
                    </nav>
                </>
            )}
        </Location>
    );
}
