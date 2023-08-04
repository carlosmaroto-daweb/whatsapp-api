const socket = io.connect('http://localhost:3000', {'forceNew' : true});
var contactsImage;
var msgMedia;
var chatElements = [];

socket.on('qr', function(data) {
    document.getElementsByClassName('qr-img')[0].style.width = "340px";
    document.getElementsByClassName('qr-img')[0].style.height = "340px";
    document.getElementsByClassName('qr-img')[0].style.background = 'url(data:image/png;base64,' + data + ')';
});

socket.on('chat-reload', function() {
    document.body.innerHTML = `
        <!-- Whatsapp Reload -->
        <div class="whatsapp-reload">
            <div class="reload-icons">
                <i class="bi bi-whatsapp"></i>
                <div class="reload-gif"></div>
                <i class="bi bi-laptop"></i>
            </div>
            <h3>Cargando tus chats...</h3>
        </div>
        <div class="whatsapp-container">
            <!-- Whatsapp Menu -->
            <div class="whatsapp-menu">
                <!-- Option Menu -->
                <div class="option-menu">
                    <div class="profile"></div>
                    <ul class="option-menu-list">
                        <li class="option-menu-item active">
                            <i class="bi bi-chat-right-dots-fill"></i>
                        </li>
                        <li class="option-menu-item">
                            <i class="bi bi-megaphone-fill"></i>
                        </li>
                        <li class="option-menu-item">
                            <i class="bi bi-alarm-fill"></i>
                        </li>
                        <li class="option-menu-item">
                            <i class="bi bi-three-dots-vertical"></i>
                        </li>
                    </ul>
                </div>
                <!-- Search -->
                <div class="search-form">
                    <div class="chat-search-container">
                        <i class="bi bi-search"></i>
                        <input class="chat-search" type="text" placeholder="Busca un chat o inicia uno nuevo.">
                    </div>
                    <div class="chat-search-option">
                        <i class="bi bi-filter"></i>
                    </div>
                </div>
                <!-- Chat Lists -->
                <div class="chat-lists">
                </div>
            </div>
            <!-- Chat Window -->
            <div class="chat-window">
                <!-- Chat Option -->
                <div class="chat-option">
                    <div class="chat-data">
                        <div class="chat-data-profile"></div>
                        <div class="chat-data-text">
                            <div class="chat-data-name">Example name</div>
                            <div class="chat-data-status">en línea</div>
                        </div>
                    </div>
                    <ul class="chat-option-list">
                        <li class="theme-switch">
                            <label class="light-theme" for="theme-mode"><i class="bi bi-sun-fill"></i></label>
                            <input id="theme-mode" class="theme-mode" type="checkbox">
                            <label class="dark-theme" for="theme-mode"><i class="bi bi-moon-fill"></i></label>
                        </li>
                        <li class="chat-option-item">
                            <i class="bi bi-search"></i>
                        </li>
                        <li class="chat-option-item">
                            <i class="bi bi-three-dots-vertical"></i>
                        </li>
                    </ul>
                </div>
                <!-- Chat Body -->
                <div class="chat-body">
                    <div class="chat-bg"></div>
                    <div class="list-msg">
                        <div class="individual-chats-bg">
                            <i class="bi bi-chat-right-dots-fill"></i>
                            <h2>Mensajes individuales</h2>
                            <h4>Habla con tus contactos o grupos de WhatsApp.</h4>
                        </div>
                    </div>
                </div>
                <!-- Keyboard -->
                <div class="keyboard">
                    <div class="option-keyboard-item">
                        <i class="bi bi-emoji-smile"></i>
                    </div>
                    <div class="option-keyboard-item">
                        <i class="bi bi-paperclip"></i>
                    </div>
                    <div class="input-text-container">
                        <input class="input-text" type="text" placeholder="Escribe un mensaje aquí">
                    </div>
                    <div class="option-keyboard-item">
                        <i class="bi bi-mic"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
});

socket.on('save-client-image', function(clientImage) {
    if(clientImage != null) {
        document.getElementsByClassName('profile')[0].setAttribute("style", "background-image: url(" + clientImage + ");");
    }
});

socket.on('save-contacts-image', function(contactsImageSent) {
    contactsImage = contactsImageSent;
});

socket.on('save-msg-media', function(msgMediaSent) {
    msgMedia = msgMediaSent;
});

function getMedia(id) {
    let media = null;
    for (let i=0; i<msgMedia.length && media == null; i++) {
        if(msgMedia[i].id == id) {
            media = msgMedia[i];
        }
    }
    return media;
}

socket.on('save-messages', function(messages) {
    let elem;
    let elemDate;
    let dateFormat;
    let dateInfo;
    let currentDate = new Date();
    currentDate = currentDate.setHours(0, 0, 0, 0);
    let messageTimestamp;
    const days = [
        'DOMINGO',
        'LUNES',
        'MARTES',
        'MIÉRCOLES',
        'JUEVES',
        'VIERNES',
        'SÁBADO',
    ];
    let groupParticipant;
    let media;
    let style;
    let body;
    let substring;
    for (let i=0; i<messages.length; i++) {
        chatElements[i] = [];
        for (let j=0; j<messages[i].length; j++) {
            if(j==0) {
                elemDate = document.createElement("div");
                elemDate.setAttribute("class", "info-msg");
                dateInfo = new Date(messages[i][j].timestamp * 1000);
                if((currentDate-dateInfo) > 144*60*60*1000) {
                    messageTimestamp = dateInfo.getDate()+"/"+(dateInfo.getMonth()+1)+"/"+dateInfo.getFullYear().toString().substring(2);
                }
                else if((currentDate-dateInfo) <= 144*60*60*1000 && (currentDate-dateInfo) > 24*60*60*1000) {
                    messageTimestamp = days[dateInfo.getDay()];
                }
                else if((currentDate-dateInfo) <= 24*60*60*1000 && (currentDate-dateInfo) > 0) {
                    messageTimestamp = "AYER";
                }
                else if((currentDate-dateInfo) <= 0) {
                    messageTimestamp = "HOY";
                }
                elemDate.textContent = messageTimestamp;
                chatElements[i].push(elemDate);
                dateInfo = dateInfo.setHours(0, 0, 0, 0);
            }
            dateFormat = new Date(messages[i][j].timestamp * 1000);
            if((dateFormat-dateInfo) >= 24*60*60*1000) {
                chatElements[i].push(elem);
                elemDate = document.createElement("div");
                elemDate.setAttribute("class", "info-msg");
                if((currentDate-dateFormat) > 144*60*60*1000) {
                    messageTimestamp = dateFormat.getDate()+"/"+(dateFormat.getMonth()+1)+"/"+dateFormat.getFullYear().toString().substring(2);
                }
                else if((currentDate-dateFormat) <= 144*60*60*1000 && (currentDate-dateFormat) > 24*60*60*1000) {
                    messageTimestamp = days[dateFormat.getDay()];
                }
                else if((currentDate-dateFormat) <= 24*60*60*1000 && (currentDate-dateFormat) > 0) {
                    messageTimestamp = "AYER";
                }
                else if((currentDate-dateFormat) <= 0) {
                    messageTimestamp = "HOY";
                }
                elemDate.textContent = messageTimestamp;
                chatElements[i].push(elemDate);
                dateInfo = dateFormat.setHours(0, 0, 0, 0);
                dateFormat = new Date(messages[i][j].timestamp * 1000);
                elem = document.createElement("div");
                if (!messages[i][j].fromMe){
                    elem.setAttribute("class", "get-conversation");
                    if(messages[i][j].id.participant) {
                        groupParticipant = `
                            <div class="group-participant-info">
                                <div class="img-profile"></div>
                                <div class="name-profile">${messages[i][j].id.participant.user}</div>
                            </div>
                        `;
                    }
                } else if (messages[i][j].fromMe){
                    elem.setAttribute("class", "sent-conversation");
                }
            }
            else {
                if (!messages[i][j].fromMe && (j==0 || messages[i][j-1].fromMe || (messages[i][j].id.participant && (messages[i][j-1].id.participant.user != messages[i][j].id.participant.user)) )){
                    if(j!=0) {
                        chatElements[i].push(elem);
                    }
                    elem = document.createElement("div");
                    elem.setAttribute("class", "get-conversation");
                    if(messages[i][j].id.participant) {
                        groupParticipant = `
                            <div class="group-participant-info">
                                <div class="img-profile"></div>
                                <div class="name-profile">${messages[i][j].id.participant.user}</div>
                            </div>
                        `;
                    }
                } else if (messages[i][j].fromMe && (j==0 || !messages[i][j-1].fromMe)){
                    if(j!=0) {
                        chatElements[i].push(elem);
                    }
                    elem = document.createElement("div");
                    elem.setAttribute("class", "sent-conversation");
                }
            }
            messageTimestamp = dateFormat.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            if(messages[i][j].hasMedia) {
                media = getMedia(messages[i][j].id.id);
                if(media) {
                    if(messages[i][j].type == "image") {
                        media = `<img class="msg-image" src="data:image/png;base64,${media.data}"/>`;
                        style = 'style="max-width: 312px;"';
                    }
                    else if(messages[i][j].type == "sticker") {
                        media = `<img class="msg-sticker" src="data:image/png;base64,${media.data}"/>`;
                        style = "";
                    }
                    else if(messages[i][j].type == "video") {
                        if(messages[i][j].isGif) {
                            media = `<video class="msg-video" src="data:video/mp4;base64,${media.data}" controls loop muted disablePictureInPicture controlsList="nofullscreen nodownload noplaybackrate"></video>`;
                            style = 'style="max-width: 312px;"';
                        }
                        else {
                            media = `<video class="msg-video" src="data:video/mp4;base64,${media.data}" controls disablePictureInPicture controlsList="nodownload noplaybackrate"></video>`;
                            style = 'style="max-width: 312px;"';
                        }
                    }
                    else if(messages[i][j].type == "ptt" || messages[i][j].type == "audio") {
                        media = `<audio class="msg-audio" src="data:audio/mpeg;base64,${media.data}" controls controlsList="nodownload noplaybackrate"></audio>`;
                        style = "";
                    }
                    else if(messages[i][j].type == "document") {
                        if(media.filename.slice(-4) == ".pdf") {
                            media = `<embed class="msg-pdf" src="data:application/pdf;base64,${media.data}" type="application/pdf"/>`;
                            style = 'style="max-width: 582px;"';
                        }
                        else {
                            media = `<a class="msg-document" href="data:application/octet-stream;base64,${media.data}" download="${media.filename}"><i class="bi bi-cloud-arrow-down"></i><div class="text">${media.filename}</div><div class="bg"></div></a>`;
                            style = 'style="max-width: 312px;"';
                        }
                    }
                    else {
                        media = "";
                        style = "";
                    }
                }
                else {
                    media = "";
                    style = "";
                }
            }
            else {
                media = "";
                style = "";
            }
            body = messages[i][j].body;
            if(body.includes("http")) {
                body = messages[i][j].body.substring(0, messages[i][j].body.indexOf("http"));
                substring = messages[i][j].body.substring(messages[i][j].body.indexOf("http"));
                while(substring.includes("http")) {
                    if(substring.indexOf("http") != 0) {
                        body += substring.substring(0, substring.indexOf("http"));
                        substring = substring.substring(substring.indexOf("http"));
                    }
                    if(substring.includes(" ")) {
                        body += `<a target="_blank" href="${substring.substring(0, substring.indexOf(" ")-1)}">${substring.substring(0, substring.indexOf(" ")-1)}</a>`;
                        substring = substring.substring(substring.indexOf(" "));
                        if(!substring.includes("http")) {
                            body += substring;
                        }
                    }
                    else {
                        body += `<a target="_blank" href="${substring.substring(substring.indexOf("http"))}">${substring.substring(substring.indexOf("http"))}</a>`;
                        substring = "";
                    }
                }
            }
            elem.innerHTML += `
                <div class="msg-body">
                    ${groupParticipant}
                    ${media}
                    <div class="msg-normal" ${style}>
                        <div class="msg-text">${body}</div>
                        <div class="msg-time">${messageTimestamp}</div>
                    </div>
                </div>
            `;
            groupParticipant = "";
        }
        chatElements[i].push(elem);
    }
});

socket.on('show-chats', function(chats) {
    const chatLists = document.getElementsByClassName('chat-lists')[0];
    let listItem;
    let img;
    let position = 0;
    let name;
    let lastMessageBody;
    let dateFormat;
    let currentDate;
    let lastMessageTimestamp;
    let unreadCount;
    let classUnseenTime;
    let classUnreadCount;
    const days = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
    ];
    chats.forEach(chat => {
        listItem = document.createElement("div");
        listItem.setAttribute("class", "list-item");
        img = 'style="background-image: url(' + contactsImage[position] + ');"';
        position++;
        name = chat.name;
        if(name.length>35) {
            name = name.substring(0, 35);
            name += "...";
        }
        lastMessageBody = chat.lastMessage.body;
        if(lastMessageBody.length>35) {
            lastMessageBody = lastMessageBody.substring(0, 35);
            lastMessageBody += "...";
        }
        if(chat.lastMessage.hasMedia) {
            if(chat.lastMessage.type == "image") {
                if(lastMessageBody == "") {
                    lastMessageBody = "Imagen";
                }
                lastMessageBody = '<i class="bi bi-image"></i>' + lastMessageBody;
            }
            else if(chat.lastMessage.type == "sticker") {
                if(lastMessageBody == "") {
                    lastMessageBody = "Sticker";
                }
                lastMessageBody = '<i class="bi bi-sticky"></i>' + lastMessageBody;
            }
            else if(chat.lastMessage.type == "video") {
                if(chat.lastMessage.isGif) {
                    if(lastMessageBody == "") {
                        lastMessageBody = "Gif";
                    }
                    lastMessageBody = '<i class="bi bi-filetype-gif"></i>' + lastMessageBody;
                }
                else {
                    if(lastMessageBody == "") {
                        lastMessageBody = "Vídeo";
                    }
                    lastMessageBody = '<i class="bi bi-film"></i>' + lastMessageBody;
                }
            }
            else if(chat.lastMessage.type == "ptt" || chat.lastMessage.type == "audio") {
                if(lastMessageBody == "") {
                    lastMessageBody = "Audio";
                }
                lastMessageBody = '<i class="bi bi-soundwave"></i>' + lastMessageBody;
            }
            else if(chat.lastMessage.type == "document") {
                if(lastMessageBody == "") {
                    lastMessageBody = "Documento";
                }
                lastMessageBody = '<i class="bi bi-file-zip"></i>' + lastMessageBody;
            }
        }
        dateFormat = new Date(chat.lastMessage.timestamp * 1000);
        currentDate = new Date();
        currentDate = currentDate.setHours(0, 0, 0, 0);
        if((currentDate-dateFormat) > 144*60*60*1000) {
            lastMessageTimestamp = dateFormat.getDate()+"/"+(dateFormat.getMonth()+1)+"/"+dateFormat.getFullYear().toString().substring(2);
        }
        else if((currentDate-dateFormat) <= 144*60*60*1000 && (currentDate-dateFormat) > 24*60*60*1000) {
            lastMessageTimestamp = days[dateFormat.getDay()];
        }
        else if((currentDate-dateFormat) <= 24*60*60*1000 && (currentDate-dateFormat) > 0) {
            lastMessageTimestamp = "Ayer";
        }
        else if((currentDate-dateFormat) <= 0) {
            lastMessageTimestamp = dateFormat.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        }
        unreadCount = chat.unreadCount;
        if(unreadCount>0) {
            classUnseenTime = "unseen-time";
            classUnreadCount = "unseen-messages";
        }
        else {
            unreadCount = "";
            classUnseenTime = "";
            classUnreadCount = "";
        }
        listItem.innerHTML = `
            <div class="list-item-img"${img}></div>
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
    let listMsg = document.getElementsByClassName('list-msg')[0];
    for(let i=0; i<listItems.length; i++){
        listItems[i].addEventListener("click", function() {
            for(let j=0; j<listItems.length; j++){
                if(i==j && listItems[j].getAttribute("class") != "list-item active") {
                    listItems[i].setAttribute("class", "list-item active");
                    document.getElementsByClassName('chat-option')[0].style.display = "flex";
                    document.getElementsByClassName('chat-data-profile')[0].setAttribute("style", "background-image: url(" + contactsImage[i] + ");");
                    document.getElementsByClassName('chat-data-name')[0].textContent = listItems[i].getElementsByClassName('list-item-name')[0].textContent;
                    document.getElementsByClassName('chat-body')[0].style.height = "calc(100vh - 122px)";
                    document.getElementsByClassName('keyboard')[0].style.display = "flex";
                    listMsg.innerHTML = "";
                    for (let q=0; q<chatElements[i].length; q++) {
                        listMsg.appendChild(chatElements[i][q]);
                    }
                    listMsg.scrollTo(0, listMsg.scrollHeight);
                }
                else {
                    listItems[j].setAttribute("class", "list-item");
                    if(i==j) {
                        document.getElementsByClassName('chat-option')[0].style.display = "none";
                        document.getElementsByClassName('chat-body')[0].style.height = "calc(100vh)";
                        document.getElementsByClassName('keyboard')[0].style.display = "none";
                        listMsg.innerHTML = `
                        <div class="individual-chats-bg">
                            <i class="bi bi-chat-right-dots-fill"></i>
                            <h2>Mensajes individuales</h2>
                            <h4>Habla con tus contactos o grupos de WhatsApp.</h4>
                        </div>
                        `;
                    }
                }
            }
        });
    };
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
                --message-background-tertiary: #006d59;
                --message-background-fourth: #2a3942;
                --theme-mode: #00a884;
                --filter-primary: invert(11%) sepia(14%) saturate(1386%) hue-rotate(158deg) brightness(94%) contrast(85%);
                --filter-secondary: invert(24%) sepia(86%) saturate(653%) hue-rotate(126deg) brightness(95%) contrast(103%);
                --filter-tertiary: invert(88%) sepia(10%) saturate(176%) hue-rotate(184deg) brightness(110%) contrast(87%);
                --opacity: 0.06;
                --loading: url(../img/loading-dark.gif);
                --reload: url(../img/reload-dark.gif);
            `;
            document.documentElement.style.cssText = styles;
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
                --message-background-tertiary: #c2fab8;
                --message-background-fourth: #f0f2f5;
                --theme-mode: #1fa855;
                --filter-primary: invert(99%) sepia(0%) saturate(0%) hue-rotate(137deg) brightness(109%) contrast(101%);
                --filter-secondary: invert(89%) sepia(27%) saturate(292%) hue-rotate(61deg) brightness(105%) contrast(103%);
                --filter-tertiary: invert(8%) sepia(13%) saturate(1671%) hue-rotate(159deg) brightness(91%) contrast(93%);
                --opacity: 0.4;
                --loading: url(../img/loading-light.gif);
                --reload: url(../img/reload-light.gif);
            `;
            document.documentElement.style.cssText = styles;
        }
    });
});