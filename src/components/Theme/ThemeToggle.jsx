import { Switch } from 'antd';
import { useEffect, useState } from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    }, []);

    const toggleTheme = (checked) => {
        setIsDark(checked);
        if (checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="theme-toggle flex items-center gap-2 px-2">
            <SunOutlined className={!isDark ? 'is-active' : ''}/>
            <Switch
                size='small'
                checked={isDark}
                onChange={toggleTheme}
                aria-label={isDark ? 'فعال‌کردن حالت روشن' : 'فعال‌کردن حالت تاریک'}
            />
            <MoonOutlined className={isDark ? 'is-active' : ''}/>
        </div>
    );
};

export default ThemeToggle
