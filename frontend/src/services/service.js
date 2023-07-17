import { createUser, deleteUser, retrieveUser } from "../state/slice/user";


export function DefaultConnection(chatSocket, dispatch, navigate, request_id, code){
    chatSocket.onopen = function () {
        chatSocket.send(
            JSON.stringify({
                action: "subscribe_instance",
                code: code,
                request_id: request_id,
            })
        );
        chatSocket.send(
            JSON.stringify({
                action: "subscribe_to_member_activity",
                request_id: request_id,
            })
        );
        chatSocket.send(
            JSON.stringify({
                action: "retrieve",
                request_id: request_id,
            })
        );
        
        
        
    }
    
    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        console.log('RealTime', data)
        switch (data.action) {
            case 'retrieve':
                if (data.action == 'retrieve'){
                dispatch(retrieveUser(data.data))
                
                console.log('retrive')
                }
            case 'create':
                if (data.action == 'create'){
                    dispatch(createUser(data.data))
                    console.log('create')
                };
            case 'delete':
                if (data.data.model == 'Member' && data.action == 'delete'){
                    dispatch(deleteUser(data.data))
                }
            default:
                break;
        }
    }; 
    chatSocket.onclose = function (e) {
        console.log('CLOSE WEBSOCKET')
        navigate('/')
    }
    chatSocket.onerror = function (e) {
        navigate('/')
    }
}