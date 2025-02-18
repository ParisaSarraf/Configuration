import { Switch } from 'antd';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark')
            setIsDark(true)
        }
    }, []);

    const toggleTheme = (checked) => {
        setIsDark(checked);
        if (checked) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    };

    return (
        <div className="flex items-center gap-2 px-4 dark:text-white">
            {/* <span className="text-sm">{isDark ? '🌙' : '☀️'}</span> */}
            <Switch checked={isDark} onChange={toggleTheme} />
        </div>
    );
};

export default ThemeToggle;