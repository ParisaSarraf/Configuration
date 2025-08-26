import {useEffect, useState} from "react";
import {Dropdown, Image, Tooltip, Button} from "antd";
import {
    LoginOutlined,
    SettingOutlined,
    SecurityScanOutlined,
    CalendarOutlined, UserOutlined,
} from "@ant-design/icons";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import PersianDate from "persian-date";
import {useMyAxios} from "@/hooks/useMyAxios.js";
import {BASEURL} from "@/Services/axiosInstance.js";


const CustomHeader = () => {
    const {handleLogout} = useMyAxios();
    const [currentTime, setCurrentTime] = useState(new PersianDate());
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const token = localStorage.getItem("accessToken");
            if (token) {
                const decoded = jwtDecode(token);
                setUserData(decoded || {});
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            setUserData({});
        }

        const interval = setInterval(() => {
            setCurrentTime(new PersianDate());
        }, 60000);

        return () => clearInterval(interval);
    }, []);


    const menuItems = [
        {
            type: 'divider',
        },
        {
            key: '1',
            label: 'داده های پایه',
            icon: <SettingOutlined/>,
            onClick: () => {
                navigate("/panel/datas");
            },
        },
        ...(userData?.is_staff ? [{
            key: '2',
            label: 'مدیریت سیستم',
            icon: <SecurityScanOutlined/>,
            onClick: () => navigate("/panel/system-management"),
        }] : []),
    ]


    return (
        <header
            className="bg-white rounded-lg my-2 mx-2 text-black ps-2 flex flex-row items-center justify-between h-12">
            <div className="flex flex-row gap-2 items-center">
                <Button
                    className="hidden md:block bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => navigate("/")}
                >مدیریت سیستم و یکپارچه سازی روال ها (مسیر) </Button>
            </div>
            <div className="flex flex-row items-center gap-4">
                <InboxOutlinedIcon/>
                <Dropdown menu={{
                    items: menuItems,
                }}
                          trigger={['click']}>
                    <div className="flex items-center gap-1 ">
                        <SettingsOutlinedIcon className="text-lg"/>
                    </div>
                    {/* )} */}
                </Dropdown>
                <Tooltip
                    title={
                        <div className="flex flex-col gap-1 p-2">
                            <div className="flex items-center gap-2 text-black">
                                <CalendarOutlined fontSize="small"/>
                                <span>تاریخ: {currentTime.format("dddd D MMMM YYYY")}</span>
                            </div>

                            <div className="flex items-center gap-2 text-black">
                                <LoginOutlined fontSize="small"/>
                                آخرین
                                ورود: {userData?.last_login ? new PersianDate(userData.last_login).format(' HH:mm MM/DD') : "-"}
                            </div>
                            <Button icon={<UserOutlined/>}
                                    className="flex items-center w-full text-white bg-purple-500"
                                    aria-label="change pass"
                                    onClick={() => navigate("/my-work")}
                            >
                                کارتابل شخصی
                            </Button>
                            <Button icon={<SecurityScanOutlined rotate={90}/>} className="flex items-center w-full"
                                    aria-label="change pass" type="primary" onClick={() => navigate("/forget-password")}
                            >
                                تغییر رمز عبور
                            </Button>
                            <Button icon={<LoginOutlined rotate={90}/>}
                                    className="flex items-center w-full bg-red-600 text-white" type="text"
                                    aria-label="Logout" onClick={() => handleLogout()}>
                                خروج
                            </Button>


                        </div>
                    }

                    placement="bottomLeft"
                    color="#ffffff"
                    overlayClassName="custom-tooltip"
                >
                    <Button type="text" className="flex items-center gap-2 bg-slate-300 ml-4" aria-label="User menu">
                        {/* <Badge dot={!!userData} status="success" className="flex flex-row items-center gap-2"> */}
                        {userData?.temp_image ? (
                            <Image
                                src={`${BASEURL.replace("/api/v1", "")}${userData.temp_image}`}
                                width={24}
                                height={24}
                                style={{borderRadius: '80%'}}
                                preview={false}
                                className="text-xl border-2 border-green-600"
                                alt={`${userData.name}'s profile`}
                                fallback={<AccountCircleOutlinedIcon className="text-xl"/>}
                            />
                        ) : (
                            <AccountCircleOutlinedIcon className="text-xl"/>
                        )}
                        {/* </Badge> */}
                        <span className="hidden sm:inline text-sm font-semibold text-gray-700 whitespace-nowrap">
              {userData?.name && userData?.last_name
                  ? `${userData.name} ${userData.last_name}`
                  : 'کاربر'
              }
            </span> </Button>
                </Tooltip>

            </div>
        </header>
    );
};

export default CustomHeader