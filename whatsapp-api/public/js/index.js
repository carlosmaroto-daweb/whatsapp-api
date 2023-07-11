const socket = io.connect('http://localhost:3000', {'forceNew' : true});

socket.on('qr', function(data) {
    document.getElementsByClassName('qr-img')[0].style.width = "340px";
    document.getElementsByClassName('qr-img')[0].style.height = "340px";
    document.getElementsByClassName('qr-img')[0].style.background = 'url(data:image/png;base64,'+data+')';
});

socket.on('chat-reload', function() {
    document.getElementsByClassName('whatsapp-qr')[0].style.display = "none";
    document.getElementsByClassName('whatsapp-reload')[0].style.display = "flex";
});

socket.on('show-chats', function(chats) {
    const chatLists = document.getElementsByClassName('chat-lists')[0];
    let listItem;
    chats.forEach(chat => {
        listItem = document.createElement("div");
        listItem.setAttribute("class", "list-item");
        let name = chat.name;
        if(name.length>35) {
            name = name.substring(0, 35);
            name += "...";
        }
        let lastMessageBody = chat.lastMessage.body;
        if(lastMessageBody.length>35) {
            lastMessageBody = lastMessageBody.substring(0, 35);
            lastMessageBody += "...";
        }
        let dateFormat = new Date(chat.lastMessage.timestamp);
        let lastMessageTimestamp = dateFormat.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        let unreadCount = chat.unreadCount;
        let classUnseenTime;
        let classUnreadCount;
        if(unreadCount>0) {
            classUnseenTime = "unseen-time";
            classUnreadCount = "unseen-messages";
        }
        else {
            unreadCount = "";
        }
        listItem.innerHTML = `
            <div class="list-item-img"></div>
            <div class="list-item-text">
                <div class="list-item-name">${name}</div>
                <div class="list-item-last-msg">${lastMessageBody}</div>
            </div>
            <div class="list-item-info">
                <div class="list-item-time ${classUnseenTime}">${lastMessageTimestamp}</div>
                <div class="list-item-unseen-messages ${classUnreadCount}">${unreadCount}</div>
            </div>
        `;
        chatLists.appendChild(listItem);
    });

    let listItems = document.getElementsByClassName('list-item');
    for(let i=0; i<listItems.length; i++){
        listItems[i].addEventListener("click", function() {
            for(let j=0; j<listItems.length; j++){
                if(i==j && listItems[j].getAttribute("class") != "list-item active") {
                    listItems[i].setAttribute("class", "list-item active");
                }
                else {
                    listItems[j].setAttribute("class", "list-item");
                }
            }
        });
    };
});

socket.on('show-messages', function(messages) {
    
});

socket.on('client-ready', function() {
    document.getElementsByClassName('whatsapp-reload')[0].style.display = "none";
    document.getElementsByClassName('whatsapp-container')[0].style.display = "flex";

    const themeMode = document.getElementsByClassName('theme-mode')[0];
    themeMode.addEventListener("change", function(){
        if (themeMode.checked == true){
            let styles = `
                --background-primary: #111b21;
                --background-secondary: #182229;
                --background-tertiary: #202c33;
                --background-fourth: #2a3942;
                --background-fifth: #ffffff29;
                --chat-background: #0b141a;
                --border-primary: #111b21;
                --border-secondary: #6b778056;
                --text-primary: #e9edef;
                --text-secondary: #d1d7db;
                --text-tertiary: #8696a0;
                --icon-primary: #aebac1;
                --unseen-messages: #00a884;
                --message-background-primary: #005c4b;
                --message-background-secondary: #202c33;
                --theme-mode: #00a884;
                --filter-primary: invert(11%) sepia(14%) saturate(1386%) hue-rotate(158deg) brightness(94%) contrast(85%);
                --filter-secondary: invert(24%) sepia(86%) saturate(653%) hue-rotate(126deg) brightness(95%) contrast(103%);
            `;
            document.documentElement.style.cssText = styles;
            document.getElementsByClassName('qr-bg')[0].style.opacity = "0.06";
            document.getElementsByClassName('qr-img')[0].style.background = "url(../img/loading-dark.gif)";
            document.getElementsByClassName('chat-bg')[0].style.opacity = "0.06";
            document.getElementsByClassName('reload-gif')[0].style.background = "url(../img/reload-dark.gif)";
        }
        else {
            let styles = `
                --background-primary: #ffffff;
                --background-secondary: #fffffff2;
                --background-tertiary: #f0f2f5;
                --background-fourth: #e4e5e9;
                --background-fifth: #00000029;
                --chat-background: #eae6df;
                --border-primary: #ffffff;
                --border-secondary: #d1d7db;
                --text-primary: #111b21;
                --text-secondary: #3b4a54;
                --text-tertiary: #667781;
                --icon-primary: #54656f;
                --unseen-messages: #1fa855;
                --message-background-primary: #d9fdd3;
                --message-background-secondary: #ffffff;
                --theme-mode: #1fa855;
                --filter-primary: invert(99%) sepia(0%) saturate(0%) hue-rotate(137deg) brightness(109%) contrast(101%);
                --filter-secondary: invert(89%) sepia(27%) saturate(292%) hue-rotate(61deg) brightness(105%) contrast(103%);
            `;
            document.documentElement.style.cssText = styles;
            document.getElementsByClassName('qr-bg')[0].style.opacity = "0.4";
            document.getElementsByClassName('qr-img')[0].style.background = "url(../img/loading-light.gif)";
            document.getElementsByClassName('chat-bg')[0].style.opacity = "0.4";
            document.getElementsByClassName('reload-gif')[0].style.background = "url(../img/reload-light.gif)";
        }
    });
});

/*
function render(data) {
    var html = data.map(function(elem, index) {
        return(`
            <div>
                ${elem.author}
                ${elem.text}
            </div>
        `);
    }).join(" ");
    document.getElementById('').innerHTML = html;
}

function addMessage(e) {
    var payload = {
        author: document.getElementById('').value,
        text: document.getElementById('').value
    }
    socket.emit('new-messages', payload);
    return false;
}*/