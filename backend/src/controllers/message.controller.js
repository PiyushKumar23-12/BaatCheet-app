import {
    sendMessage,
    getUsers,
    getMessage
} from "../services/message.service.js";

export const getUsersForSideBar = async (req, res) => {
    const filteredUsers = await getUsers({
        id: req.user._id
    });

    res.status(200).json(filteredUsers);
};

// Get messages between us and a particular user
export const getMessages = async (req, res) => {
    const message = await getMessage({
        myId: req.user._id,
        userToChatId: req.params.id
    });

    res.status(200).json(message);
};

// Send message
export const sendMessages = async (req, res) => {
    const message = await sendMessage({
        senderId: req.user._id,
        receiverId: req.params.id,
        text: req.body.text,
        image: req.body.image,
    });

    res.status(201).json(message);
};