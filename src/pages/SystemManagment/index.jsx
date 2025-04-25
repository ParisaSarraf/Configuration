import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function SystemManagment() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-Main p-2">
      <div className="my-1 p-2 bg-white shadow-md rounded-lg">
        <Button
          type="primary"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => navigate("/")}
        >
          بازگشت به صفحه اصلی
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          <Button
            ghost
            onClick={() => navigate("/panel/system-managment/user")}
            className="flex w-full items-center justify-center h-48 bg-white shadow-lg hover:shadow-xl transition-shadow text-blue-500 hover:text-white hover:bg-blue-500 text-lg font-medium  rounded-tl-3xl rounded-br-3xl"
          >
            مدیریت کاربران
          </Button>
          <Button
            ghost
            onClick={() => navigate("/panel/system-managment/roles-permission")}
            className="flex items-center justify-center h-48 bg-white shadow-lg hover:shadow-xl transition-shadow text-green-500 hover:text-white hover:bg-green-500 text-lg font-medium rounded-sm rounded-tl-3xl rounded-br-3xl"
          >
            مدیریت سمت ها و مجوز ها
          </Button>
          <Button
            ghost
            onClick={() => navigate("/panel/system-managment/roles-life-cycle")}
            className="flex items-center justify-center h-48 bg-white shadow-lg hover:shadow-xl transition-shadow text-yellow-500 hover:text-white hover:bg-yellow-500 text-lg font-medium rounded-sm rounded-tl-3xl rounded-br-3xl"
          >
            مدیریت کاربران و دسترسی اسناد
          </Button>
          <Button
            ghost
            onClick={() => navigate("/panel/system-managment/roles-users")}
            className="flex items-center justify-center h-48 bg-white shadow-lg hover:shadow-xl transition-shadow text-purple-500 hover:text-white hover:bg-purple-500 text-lg font-medium rounded-sm rounded-tl-3xl rounded-br-3xl"
          >
            مدیریت کاربران و دسترسی محصول
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SystemManagment;