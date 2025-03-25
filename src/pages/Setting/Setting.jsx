import { Button, Card } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Setting = () => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/")}
                >
                    بازگشت به صفحه اصلی
                </Button>
            </div>
            <Card className="p-4 bg-white shadow-md rounded-lg"></Card>
        </div>
    )
}

export default Setting
