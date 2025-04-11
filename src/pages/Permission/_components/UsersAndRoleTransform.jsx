import { useState, useEffect } from "react";
import { useUserList } from "../../../QueryServises/userQuery";
import { usePermissionList } from "../../../QueryServises/PermissionQuery";
import { useProductList } from "../../../QueryServises/productQuery"; // فرض بر این است که یک hook برای دریافت محصولات داریم

const UsersAndPermissionsTransfer = () => {
    const { data: usersData = [], isLoading: usersLoading } = useUserList();
    const { data: permissionsData = [], isLoading: permissionsLoading } = usePermissionList();
    const { data: productsData = [], isLoading: productsLoading } = useProductList(); // دریافت محصولات

    const [boxes, setBoxes] = useState({
        users: [],
        permissions: [],
        products: [],
        assigned: []
    });

    const [selectedItems, setSelectedItems] = useState({
        users: [],
        permissions: [],
        assigned: []
    });

    const [filteredPermissions, setFilteredPermissions] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        setBoxes({
            users: Array.isArray(usersData) ? [...usersData] : [],
            permissions: Array.isArray(permissionsData) ? [...permissionsData] : [],
            products: Array.isArray(productsData) ? [...productsData] : [],
            assigned: []
        });
    }, [usersData, permissionsData, productsData]);

    const handleSelect = (boxName, itemId) => {
        setSelectedItems(prev => ({
            ...prev,
            [boxName]: prev[boxName].includes(itemId)
                ? prev[boxName].filter(id => id !== itemId)
                : [...prev[boxName], itemId]
        }));

        // به‌روزرسانی لیست دسترسی‌ها و محصولات
        if (boxName === 'users') {
            const selectedUserPermissions = boxes.assigned.filter(assignment => assignment.userId === itemId);
            setFilteredPermissions(selectedUserPermissions.map(assignment => assignment.permissionId));
            setFilteredProducts(boxes.products.filter(product =>
                !selectedUserPermissions.some(assignment => assignment.permissionId === product.permissionId)
            ));
        }
    };

    const assignUsersToPermissions = () => {
        // کد قبلی برای انتقال کاربران به دسترسی‌ها
    };

    const assignPermissionsToUsers = () => {
        // کد قبلی برای اختصاص دسترسی‌ها به کاربران
    };

    const removeAssignment = (assignmentIndex) => {
        // کد قبلی برای حذف اختصاص‌ها
    };

    const renderBox = (boxName, title, items = [], isLoading, hasNext = true, hasPrev = false) => (
        <div className="flex-1 flex flex-col border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-center font-bold text-lg mb-3 text-gray-700">{title}</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="border border-gray-200 rounded-md p-3 h-[300px] overflow-y-auto flex-1">
                        {items && items.length > 0 ? (
                            items.map(item => (
                                <div
                                    key={item.id}
                                    className={`p-2 mb-1 rounded cursor-pointer transition-colors ${selectedItems[boxName].includes(item.id)
                                        ? "bg-blue-100 border border-blue-300"
                                        : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => handleSelect(boxName, item.id)}
                                >
                                    {item.name || item.title || item.label}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                {boxName === 'assigned'
                                    ? 'هیچ اختصاصی ثبت نشده است'
                                    : 'داده‌ای برای نمایش وجود ندارد'}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between mt-2">
                        {hasPrev && (
                            <button
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={boxName === 'permissions' ? assignUsersToPermissions : () => { }}
                            >
                                ← بازگشت
                            </button>
                        )}

                        {hasNext && (
                            <button
                                className={`px-3 py-1 rounded ml-auto ${(boxName === 'users' && selectedItems.users.length > 0) ||
                                    (boxName === 'permissions' && selectedItems.permissions.length > 0 && selectedItems.users.length > 0)
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                onClick={boxName === 'users' ? assignUsersToPermissions : assignPermissionsToUsers}
                                disabled={
                                    (boxName === 'users' && selectedItems.users.length === 0) ||
                                    (boxName === 'permissions' && (selectedItems.permissions.length === 0 || selectedItems.users.length === 0))
                                }
                            >
                                {boxName === 'users' ? 'انتقال به دسترسی‌ها →' : 'اختصاص دادن →'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    const renderAssignedBox = () => (
        <div className="flex-1 flex flex-col border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-center font-bold text-lg mb-3 text-gray-700">محصولات</h3>
            <div className="border border-gray-200 rounded-md p-3 h-[300px] overflow-y-auto flex-1">
                {boxes.assigned && boxes.assigned.length > 0 ? (
                    boxes.assigned.map((assignment, index) => (
                        <div
                            key={`${assignment.userId}-${assignment.permissionId}-${index}`}
                            className="p-2 mb-1 rounded border border-gray-200 hover:bg-gray-50 flex justify-between items-center"
                        >
                            <div>
                                <span className="font-medium">{assignment.user?.name}</span>
                                <span className="mx-2">-</span>
                                <span>{assignment.permission?.title}</span>
                            </div>
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeAssignment(index)}
                            >
                                حذف
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10">هیچ اختصاصی ثبت نشده است</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex gap-5 p-5 max-w-6xl mx-auto bg-gray-50 rounded-lg">
            {renderBox('users', 'لیست کاربران', boxes.users, usersLoading, true, false)}
            {/* {renderBox('permissions', 'لیست دسترسی‌ها', filteredPermissions, permissionsLoading, true, true)} */}
            {renderBox('products', 'لیست محصولات', filteredProducts, productsLoading, true, true)}
            {renderAssignedBox()}
        </div>
    );
};

export default UsersAndPermissionsTransfer;
