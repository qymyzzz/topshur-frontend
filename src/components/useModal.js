import { useState } from "react";

const useModal = () => {
    const [isModalVisible, setModalVisibility] = useState(false);
    const showModal = () => setModalVisibility(true);
    const hideModal = () => setModalVisibility(false);

    return{
        isModalVisible,
        showModal,
        hideModal
    }
}

export default useModal;