import {useState} from 'react';
import {message} from 'antd';
import {useCreateAccessProducts, useDeleteAccessProducts,} from '../../QueryServises/accsessQuery';
import {useQueryClient} from "@tanstack/react-query";

export const useAccessManagement = () => {
    const queryClient = useQueryClient();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState([]);

    const {mutateAsync: createAccess, isLoading: isCreating} = useCreateAccessProducts();
    const {mutateAsync: deleteAccess, isLoading: isDeleting} = useDeleteAccessProducts();

    const handleSuccess = () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('access');
        setSelectedProductIds([]);
    };

    const handleAddAccess = async () => {
        if (!selectedUserId || !selectedRoleId || selectedProductIds.length === 0) {
            return message.warning('لطفاً کاربر، سمت و حداقل یک محصول را انتخاب کنید.');
        }

        const payload = {
            user_id: selectedUserId,
            role_id: selectedRoleId,
            product_ids: selectedProductIds,
        };

        try {
            await createAccess(payload, {
                onSuccess: () => {
                    message.success("محصولات با موفقیت به سمت مورد نظر اضافه شدند.");
                    handleSuccess();
                },
            });
        } catch (error) {
            message.error("مشکلی در اضافه کردن محصول پیش آمده است.");
            console.error(error);
        }
    };

    const handleDeleteAccess = async (accessId) => {
        try {
            await deleteAccess(accessId, {
                onSuccess: () => {
                    message.success("دسترسی با موفقیت حذف شد.");
                    handleSuccess();
                },
            });
        } catch (error) {
            message.error("خطا در حذف دسترسی.");
            console.error(error);
        }
    };

    const onUserSelect = (userId) => {
        setSelectedUserId(userId);
        setSelectedRoleId(null);
        setSelectedProductIds([]);
    };


    const onRoleSelect = (roleId) => {
        setSelectedRoleId(roleId);
        setSelectedProductIds([]);
    };


    return {
        selectedUserId,
        selectedRoleId,
        selectedProductIds,
        onUserSelect,
        onRoleSelect,
        setSelectedProductIds,
        handleAddAccess,
        handleDeleteAccess,
        isCreating,
        isDeleting,
    };
};