import { Button, Card } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Genus from './components/Genus'
import Personality from './components/Personality'
import Casing from './components/Casing'

const Setting = () => {
    const navigate = useNavigate()
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
            <div className='grid grid-cols-3 gap-2'>
                <Casing />
                <Personality />
                <Genus />
            </div>
        </div>
    )
}

export default Setting
