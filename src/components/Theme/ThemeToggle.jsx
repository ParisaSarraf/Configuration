import { Switch } from 'antd';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
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
        <div className="flex items-center gap-2 px-4 ">
            <Switch
                size='default'
                checked={isDark}
                onChange={toggleTheme}
            // checkedChildren="🌙"
            // unCheckedChildren="☀️"
            />
        </div>
    );
};

export default ThemeToggle