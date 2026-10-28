import {useState} from 'react';
import {useUserList} from '../../../QueryServises/userQuery';
import {Avatar, Empty, Input, List, Spin} from 'antd';
import {UserOutlined} from '@ant-design/icons';

const UserSelectionPanel = ({selectedUserId, onSelectUser}) => {
    const {data: users, isLoading, isError} = useUserList();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users?.filter(user =>
        `${user.name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const PanelHeader = (
        <div className="p-4 border-b theme-border">
            <h2 className="text-base font-semibold theme-text">۱. انتخاب کاربر</h2>
            <Input.Search
                placeholder="جستجوی کاربر..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-3"
            />
        </div>
    );

    if (isError) return <div className="text-red-500 p-4">خطا در بارگذاری کاربران</div>;

    return (
        <div className="theme-surface rounded-xl shadow-lg border theme-border flex flex-col h-full">
            {PanelHeader}
            {isLoading ? <div className="flex-1 flex justify-center items-center"><Spin/></div> :
                !filteredUsers || filteredUsers.length === 0 ?
                    <div className="flex-1 flex justify-center items-center"><Empty description="هیچ کاربری یافت نشد"/>
                    </div> :
                    <List
                        className="p-2 flex-1 overflow-y-auto"
                        dataSource={filteredUsers}
                        renderItem={(user) => (
                            <List.Item
                                onClick={() => onSelectUser(user.id)}
                                className={`!p-3 !my-1 rounded-lg cursor-pointer transition-colors ${selectedUserId === user.id ? 'theme-accent-soft' : 'hover:theme-canvas'}`}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined/>}
                                                    src={user.temp_image }/>}
                                    title={<span
                                        className="font-medium theme-text">{`${user.name} ${user.last_name} (${user.username})`}</span>}
                                />
                            </List.Item>
                        )}
                    />}
        </div>
    );
};

export default UserSelectionPanel;