let list = [{
    id: -150874076,
    title: '業務群組',
    type: 'group'
}, {
    id: -155069392,
    title: '玻璃製造群組',
    type: 'group'
}, {
    id: -157638300,
    title: '資訊群組',
    type: 'group'
}, {
    id: -164742782,
    title: '產品開發群組',
    type: 'group'
}, {
    id: -162201704,
    title: '測試群組',
    type: 'group'
}];

function getChatID(title) {
    let chat_id;
    list.forEach(function(chatObject) {
        if (chatObject.title === title) {
            chat_id = chatObject.id;
        }
    });
    return chat_id;
}

module.exports = {
    getChatID: getChatID,
    list: list
};
