var ESTATE_LOOKUP = {
  "Amber Street":"summerstone","Amber St":"summerstone",
  "Summerstone Boulevard":"summerstone","Summerstone Blvd":"summerstone",
  "Breeze Street":"summerstone","Festival Street":"summerstone",
  "Tropic Street":"summerstone","Dune Street":"summerstone",
  "Sunrise Street":"summerstone","Island Parade":"summerstone",
  "Sunset Street":"summerstone","Golden Road":"summerstone",
  "Pocketstone Court":"summerstone","Moreton Parade":"summerstone",
  "Bloom Drive":"summerstone","Harvest Street":"summerstone",
  "Essence Street":"summerstone","Freshwater Street":"summerstone",
  "Kingfisher Avenue":"summerstone",
  "Anderson Road":"montrose","Baird Road":"montrose",
  "Batchen Street":"montrose","Blaven Street":"montrose",
  "Blewers Road":"montrose","Carisbrook Street":"montrose",
  "Earlisland Circuit":"montrose","Fig Tree Esplanade":"montrose",
  "Glenmore Street":"montrose","Grandtown Drive":"montrose",
  "Hepworth Way":"montrose","Landings Boulevard":"montrose",
  "Lindsay Road":"montrose","Moray Street":"montrose",
  "Mosset Street":"montrose","Prosperous Street":"montrose",
  "Randolph Boulevard":"montrose","Robbs Road":"montrose",
  "Roysvale Way":"montrose","Varis Street":"montrose",
  "Wellside Street":"montrose"
};

var ESTATES = {
  summerstone:{name:"Summerstone Estate",suburb:"Morayfield",council:"Moreton Bay City",color:"#313131",accent:"#c9a84c",logo:"/summerstone.png",boundary:"55,45 215,45 215,265 55,265",binDay:"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Green waste: Monday &middot; Put out: Tuesday night"},
  montrose:{name:"Montrose",suburb:"Morayfield",council:"Moreton Bay City",color:"#1a2a6b",accent:"#b8c5d6",logo:null,seriesM:true,boundary:"160,45 310,45 310,200 160,200",binDay:"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Put out: Tuesday night"},
  default:{name:null,suburb:null,council:"Greater Brisbane",color:"#1a3020",accent:"#69f0ae",logo:null,boundary:null,binDay:"&#128721; Check moretonbay.qld.gov.au for your bin day schedule"}
};

var BIN_SCHEDULES = {
  "morayfield":"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Green waste: Monday &middot; Put out: Tuesday night",
  "caboolture":"&#128721; General waste: Thursday &middot; Recycling: alternating Thursday &middot; Put out: Wednesday night",
  "redcliffe":"&#128721; General waste: Tuesday &middot; Recycling: alternating Tuesday &middot; Put out: Monday night",
  "narangba":"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Put out: Tuesday night",
  "burpengary":"&#128721; General waste: Thursday &middot; Recycling: alternating Thursday &middot; Put out: Wednesday night"
};

function getEstateFromAddress(a){if(!a)return"default";var al=a.toLowerCase();for(var s in ESTATE_LOOKUP){if(al.indexOf(s.toLowerCase())!==-1)return ESTATE_LOOKUP[s];}return"default";}
function getCouncilFromSuburb(s){if(!s)return"Greater Brisbane";var sl=s.toLowerCase();if(["morayfield","caboolture","redcliffe","narangba","burpengary","deception bay","kippa-ring","rothwell","clontarf","scarborough","woody point","margate"].some(function(x){return sl.indexOf(x)!==-1;}))return"Moreton Bay City";if(["ipswich","springfield","ripley","goodna","redbank","camira"].some(function(x){return sl.indexOf(x)!==-1;}))return"Ipswich City";if(["logan","beenleigh","browns plains","springwood","loganholme"].some(function(x){return sl.indexOf(x)!==-1;}))return"Logan City";if(["brisbane","chermside","fortitude valley","paddington","newstead"].some(function(x){return sl.indexOf(x)!==-1;}))return"Brisbane City";return"Greater Brisbane";}

var userAddress=localStorage.getItem("sc_address")||"";
var userPhone=localStorage.getItem("sc_phone")||"";
var userSuburb=localStorage.getItem("sc_suburb")||"";
var userDisplay=localStorage.getItem("sc_display")||"Neighbour";
var isLoggedIn=userPhone!=="";
var currentChatLevel="street";
var lastMsgCount=0;
var isScrolledToBottom=true;
var dmRecipient=null;
var dmConversations={};

window.addEventListener("online",function(){document.getElementById("offlineBanner").style.display="none";loadMessages();});
window.addEventListener("offline",function(){document.getElementById("offlineBanner").style.display="block";});

function switchTab(t,b){
  document.querySelectorAll(".content").forEach(function(e){e.style.display="none";});
  document.querySelectorAll(".tab").forEach(function(e){e.classList.remove("active");});
  document.getElementById("tab-"+t).style.display="flex";
  if(b&&b.classList)b.classList.add("active");
}

function setChatLevel(level,btn){
  currentChatLevel=level;
  document.querySelectorAll(".clt-btn").forEach(function(b){b.classList.remove("active");});
  btn.classList.add("active");
  loadMessages();
}

function setFilter(t,b){
  document.querySelectorAll(".filter-btn").forEach(function(x){x.classList.remove("active");});
  b.classList.add("active");
  document.querySelectorAll("#chatMessages>[data-type]").forEach(function(e){
    if(t==="all")e.style.display="";
    else if(t==="official")e.style.display=e.dataset.type==="official"?"":"none";
    else e.style.display=(e.dataset.type==="neighbour"||e.dataset.type==="me")?"":"none";
  });
}

function toggleLike(b,c){
  if(b.classList.contains("liked")){b.classList.remove("liked");b.textContent=c>1?"&#128077; "+(c-1):"&#128077;";}
  else{b.classList.add("liked");b.textContent="&#128077; "+(c+1);}
}

function scrollToBottom(){
  document.getElementById("chatBottom").scrollIntoView({behavior:"smooth"});
  document.getElementById("newMsgsBanner").style.display="none";
}

function sendMsg(){
  var i=document.getElementById("chatInput");
  if(!i.value.trim())return;
  if(!isLoggedIn){alert("Please sign up to post messages.");window.location.href="/signup.html";return;}
  var content=i.value.trim();
  i.value="";
  document.getElementById("sendBtn").style.background="#ccc";
  fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:userPhone,address:userAddress,suburb:userSuburb,content:content,display_name:userDisplay})}).then(function(){loadMessages();}).catch(function(){});
  var a=document.getElementById("aiNote");a.style.display="block";
  setTimeout(function(){a.style.display="none";},3000);
}

async function loadMessages(){
  try{
    var res=await fetch("/api/messages");
    if(!res.ok)return;
    var data=await res.json();
    var msgs=data.messages||[];

        if(currentChatLevel==="street"&&userAddress){
      var myStreet=userAddress.split(",")[0].trim().replace(/^[0-9]+[a-zA-Z]?\s+/,"").toLowerCase();
      if(myStreet)msgs=msgs.filter(function(m){
        var mStreet=(m.address||"").split(",")[0].trim().replace(/^[0-9]+[a-zA-Z]?\s+/,"").toLowerCase();
        return mStreet.indexOf(myStreet)!==-1||myStreet.indexOf(mStreet)!==-1||m.suburb==="ADMIN_MSG";
      });
    } else if(currentChatLevel==="estate"){
      var myEstate=getEstateFromAddress(userAddress);
      if(myEstate!=="default")msgs=msgs.filter(function(m){
        return getEstateFromAddress(m.address||"")===myEstate||m.suburb==="ADMIN_MSG";
      });
    }

    var container=document.getElementById("myMessages");
    container.innerHTML="";

    msgs.forEach(function(msg){
      var isMe=msg.phone===userPhone;
      var n=new Date(msg.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
            var displayName=msg.display_name||"Neighbour";
            var rawStreet=(msg.address||"").split(",")[0].trim();
      var streetName=rawStreet.replace(/^[0-9]+[a-zA-Z]?\s+/,"");
      if(!streetName&&msg.suburb&&msg.suburb!=="ADMIN_MSG")streetName=msg.suburb;

      var d=document.createElement("div");
      d.className="msg-row"+(isMe?" me":"");
      d.dataset.type=isMe?"me":"neighbour";

      if(isMe){
        d.innerHTML="<div style='max-width:75%'>"+
          "<div class='msg-meta' style='text-align:right;'><span style='color:#aaa;font-size:9px;'>"+n+"</span></div>"+
          "<div class='bubble me'><p>"+msg.content+"</p></div>"+
          "<button onclick='deleteMsg("+JSON.stringify(msg.id)+")' class='del-btn'>&#128465; delete</button>"+
          "</div><div class='msg-av' style='margin-bottom:22px;'>"+(userPhoto?"<img src='"+userPhoto+"' style='width:32px;height:32px;border-radius:50%;object-fit:cover;border:1.5px solid var(--ea);'/>":"&#127968;")+"</div>";
      } else {
        d.innerHTML="<div class='msg-av'>&#127968;</div>"+
          "<div style='max-width:75%'>"+
          "<div class='msg-meta'><strong style='color:#444;font-size:10px;'>"+displayName+"</strong>"+
          (streetName?"<span style='color:#aaa;font-size:9px;'> &middot; "+streetName+"</span>":"")+
          "<span style='color:#bbb;font-size:9px;'> &middot; "+n+"</span></div>"+
          "<div class='bubble them'><p>"+msg.content+"</p></div>"+
          "</div>";
      }
      container.appendChild(d);
    });

    var bottom=document.getElementById("chatBottom");
    if(bottom)bottom.scrollIntoView({behavior:"smooth"});
  } catch(e){console.log("msg error:",e);}
}

async function deleteMessage(id){
  if(!confirm("Delete this message?"))return;
  try{await fetch("/api/messages",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:id,phone:userPhone})});loadMessages();}catch(e){}
}

async function deleteMsg(id){if(!confirm("Delete this message?"))return;try{await fetch("/api/messages",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:id,phone:userPhone})});loadMessages();}catch(e){}}
loadMessages();
setInterval(loadMessages,10000);

// ── PROFILE PHOTO ────────────────────────────────────────────────────────────
var userPhoto = localStorage.getItem("sc_photo") || "";

function handlePhotoUpload(event){
  var file = event.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var img = new Image();
    img.onload = function(){
      var canvas = document.createElement('canvas');
      var maxSize = 150;
      var w = img.width, h = img.height;
      if(w > h){ h = Math.round(h*(maxSize/w)); w = maxSize; } else { w = Math.round(w*(maxSize/h)); h = maxSize; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      var compressed = canvas.toDataURL('image/jpeg', 0.8);
      userPhoto = compressed;
      localStorage.setItem("sc_photo", compressed);
      updatePhotoDisplay();
      showPush({icon:"&#128247;",title:"Photo updated!",body:"Your profile photo has been saved.",color:"var(--ec)"});
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updatePhotoDisplay(){
  var avatarImg = document.getElementById("profileAvatarImg");
  var avatarText = document.getElementById("profileAvatarText");
  if(userPhoto && avatarImg){
    avatarImg.src = userPhoto;
    avatarImg.style.display = "block";
    if(avatarText) avatarText.style.display = "none";
  } else if(avatarImg){
    avatarImg.style.display = "none";
    if(avatarText) avatarText.style.display = "block";
  }
  var headerImg = document.getElementById("headerAvatarImg");
  var headerText = document.getElementById("headerAvatarText");
  if(userPhoto && headerImg){
    headerImg.src = userPhoto;
    headerImg.style.display = "inline-block";
    if(headerText) headerText.style.display = "none";
  } else if(headerImg){
    headerImg.style.display = "none";
    if(headerText) headerText.style.display = "inline";
  }
}

function openDMWith(name,phone){
  if(!isLoggedIn){alert("Please sign up to send direct messages.");return;}
  if(phone===userPhone)return;
  dmRecipient={name:name,phone:phone};
  document.getElementById("dmTitle").textContent="&#128172; "+name;
  if(!dmConversations[phone])dmConversations[phone]=[];
  renderDMs();
  document.getElementById("dmModal").style.display="flex";
}

function closeDM(){document.getElementById("dmModal").style.display="none";}

function renderDMs(){
  if(!dmRecipient)return;
  var msgs=dmConversations[dmRecipient.phone]||[];
  var container=document.getElementById("dmMessages");
  container.innerHTML="";
  if(msgs.length===0){
    container.innerHTML="<div class='empty-state' style='padding:16px;'>Start a private conversation with "+dmRecipient.name+"</div>";
    return;
  }
  msgs.forEach(function(m){
    var isMe=m.from===userPhone;
    var d=document.createElement("div");
    d.className="msg-row"+(isMe?" me":"");
    if(isMe){
      d.innerHTML="<div style='max-width:75%'><div class='bubble me'><p>"+m.text+"</p></div></div><div class='msg-av'>&#127968;</div>";
    } else {
      d.innerHTML="<div class='msg-av'>&#127968;</div><div style='max-width:75%'><div class='bubble them'><p>"+m.text+"</p></div></div>";
    }
    container.appendChild(d);
  });
  container.scrollTop=container.scrollHeight;
}

function sendDM(){
  var input=document.getElementById("dmInput");
  if(!input.value.trim()||!dmRecipient)return;
  var msg={from:userPhone,to:dmRecipient.phone,text:input.value.trim(),time:new Date()};
  if(!dmConversations[dmRecipient.phone])dmConversations[dmRecipient.phone]=[];
  dmConversations[dmRecipient.phone].push(msg);
  input.value="";
  renderDMs();
  showPush({icon:"&#128172;",title:"DM sent to "+dmRecipient.name,body:msg.text.substring(0,50),color:"#313131"});
}

var INCIDENT_DISTS={1:120,2:80,3:350,4:600,5:420,6:180};
var INCS={
  1:{emoji:"&#128663;",title:"Suspicious Vehicle",addr:"Summerstone Blvd",time:"Today",sev:"high",sc:"#e53935",desc:"White sedan parked for 3+ hours. Police alerted.",status:"Patrols active",rep:"Local resident",color:"#fb8c00",trust:1},
  2:{emoji:"&#128230;",title:"Package Theft",addr:"Summerstone Blvd",time:"Yesterday",sev:"medium",sc:"#fb8c00",desc:"Parcel stolen from front porch. Reported to police.",status:"Police notified",rep:"Local resident",color:"#e53935",trust:3},
  3:{emoji:"&#9998;",title:"Graffiti",addr:"Freshwater St",time:"2 days ago",sev:"low",sc:"#43a047",desc:"Graffiti on bus shelter. Council notified.",status:"Resolved",rep:"Local resident",color:"#7b1fa2",trust:5},
  4:{emoji:"&#128690;",title:"Bike Stolen",addr:"Local street",time:"3 days ago",sev:"medium",sc:"#fb8c00",desc:"Mountain bike stolen overnight.",status:"Police report filed",rep:"Local resident",color:"#e53935",trust:2},
  5:{emoji:"&#128021;",title:"Loose Dog",addr:"Local street",time:"Today",sev:"high",sc:"#e53935",desc:"Large staffy running loose. Rangers called.",status:"Rangers called",rep:"Local resident",color:"#388e3c",trust:4},
  6:{emoji:"&#9888;",title:"Door-to-Door Scam",addr:"Local area",time:"Yesterday",sev:"medium",sc:"#fb8c00",desc:"Men claiming to be from energy company. NOT legitimate.",status:"Scam Aware notified",rep:"Multiple residents",color:"#fb8c00",trust:5}
};

var currentMapMode = 'street';

var ESTATE_SVG_HIGHLIGHTS = {
  summerstone: {
    boundary: '55,45 215,45 215,265 55,265',
    streets: [
      {d:'M155,0 L155,290', label:'Summerstone Blvd', color:'rgba(201,168,76,0.6)', width:4},
      {d:'M38,65 L155,65', label:'Freshwater St', color:'rgba(201,168,76,0.4)', width:3},
      {d:'M38,155 L245,155', label:'Tide St', color:'rgba(201,168,76,0.4)', width:3},
      {d:'M100,240 L280,240', label:'Amber St area', color:'rgba(201,168,76,0.4)', width:3}
    ]
  },
  montrose: {
    boundary: '160,45 310,45 310,200 160,200',
    streets: [
      {d:'M245,0 L245,290', label:'Grandtown Dr', color:'rgba(184,197,214,0.6)', width:4},
      {d:'M195,155 L320,155', label:'Montrose streets', color:'rgba(184,197,214,0.4)', width:3}
    ]
  }
};

function setMapMode(mode, btn) {
  currentMapMode = mode;
  document.querySelectorAll('.map-mode-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');

  var streetInfo = document.getElementById('modeStreetInfo');
  var estateInfo = document.getElementById('modeEstateInfo');
  var radiusControls = document.getElementById('modeRadiusControls');
  var radiusInfo = document.getElementById('radiusInfo');
  var radiusRing = document.getElementById('radiusRing');
  var radiusLabelBg = document.getElementById('radiusLabelBg');
  var radiusLabelTxt = document.getElementById('radiusLabelTxt');
  var boundary = document.getElementById('estateBoundary');
  var streetHighlight = document.getElementById('streetHighlight');

    if(streetInfo) streetInfo.style.display = 'none';
  if(estateInfo) estateInfo.style.display = 'none';
  if(radiusControls) radiusControls.style.display = 'none';
  if(radiusRing) radiusRing.style.display = 'none';
  if(radiusLabelBg) radiusLabelBg.style.display = 'none';
  if(radiusLabelTxt) radiusLabelTxt.style.display = 'none';
  if(boundary) boundary.setAttribute('display', 'none');
  if(streetHighlight) streetHighlight.setAttribute('display', 'none');

  var ek = getEstateFromAddress(userAddress);
  var estate = ESTATES[ek] || ESTATES.default;
  var highlights = ESTATE_SVG_HIGHLIGHTS[ek];

  if(mode === 'street') {
    if(streetInfo) streetInfo.style.display = 'block';
    if(radiusInfo) radiusInfo.textContent = '&#127968; Notifications from ' + (userAddress ? userAddress.split(',')[0].replace(/^\d+\s+/,'') : 'your street') + ' only';
        if(streetHighlight) {
      streetHighlight.setAttribute('display', '');
            var myStreet = userAddress ? userAddress.split(',')[0].replace(/^\d+\s+/,'').toLowerCase() : '';
      var strokeColor = ek === 'montrose' ? 'rgba(184,197,214,0.8)' : 'rgba(201,168,76,0.8)';
      streetHighlight.setAttribute('stroke', strokeColor);
    }
  } else if(mode === 'estate') {
    if(estateInfo) estateInfo.style.display = 'block';
    if(radiusInfo) radiusInfo.innerHTML = '&#127960; Notifications from ' + (estate.name || 'your estate') + ' only';
        if(boundary && highlights) {
      boundary.setAttribute('points', highlights.boundary);
      var strokeColor = ek === 'montrose' ? 'rgba(184,197,214,0.5)' : 'rgba(201,168,76,0.5)';
      var fillColor = ek === 'montrose' ? 'rgba(184,197,214,0.08)' : 'rgba(201,168,76,0.08)';
      boundary.setAttribute('stroke', strokeColor);
      boundary.setAttribute('fill', fillColor);
      boundary.setAttribute('display', '');
    }
  } else if(mode === 'radius') {
    if(radiusControls) radiusControls.style.display = 'block';
    if(radiusRing) radiusRing.style.display = '';
    if(radiusLabelBg) radiusLabelBg.style.display = '';
    if(radiusLabelTxt) radiusLabelTxt.style.display = '';
    updateRadius(document.getElementById('radiusSlider').value);
  }
}

function updateRadius(v){
  var rM=parseInt(v);
  var d=rM>=5000?"Suburb wide":rM>=1000?(rM/1000).toFixed(1)+"km":rM+"m";
  document.getElementById("radiusVal").textContent=d;
  document.getElementById("radiusLabelTxt").textContent=d;
  var r=(rM/1500)*100;
  document.getElementById("radiusRing").setAttribute("r",r);
  document.getElementById("radiusLabelBg").setAttribute("x",155-22);
  document.getElementById("radiusLabelBg").setAttribute("y",143-r-14);
  document.getElementById("radiusLabelTxt").setAttribute("x",155);
  document.getElementById("radiusLabelTxt").setAttribute("y",143-r-5);
  var inRange=0;
  for(var id in INCIDENT_DISTS){
    var inside=INCIDENT_DISTS[id]<=rM;if(inside)inRange++;
    var btn=document.getElementById("incBtn"+id);
    if(btn)btn.className="inc-list-btn"+(inside?"":" dimmed");
    var marker=document.getElementById("incMarker"+id);
    if(marker)marker.style.opacity=inside?"1":"0.25";
  }
  document.getElementById("radiusInfo").textContent="&#128225; "+inRange+" of 6 incidents within "+d+" · "+(6-inRange)+" filtered";
}
function setRadius(v){document.getElementById("radiusSlider").value=v;updateRadius(v);}
function toggleRadius(){var t=document.getElementById("radiusToggle");var on=t.textContent==="ON";t.textContent=on?"OFF":"ON";t.className=on?"radius-toggle off":"radius-toggle";["radiusRing","radiusLabelBg","radiusLabelTxt","radiusInfo"].forEach(function(id){document.getElementById(id).style.display=on?"none":"";});}

function selectInc(id){
  var sel=window.selI===id?null:id;window.selI=sel;
  document.querySelectorAll("[id^=incBtn]").forEach(function(b){b.classList.remove("selected");});
  var detail=document.getElementById("incDetail");
  if(!sel){detail.style.display="none";return;}
  document.getElementById("incBtn"+id).classList.add("selected");
  var inc=INCS[id];
  var trustPct=Math.min(100,(inc.trust/5)*100);
  detail.style.borderLeftColor=inc.color;detail.style.display="block";
  detail.innerHTML="<div class='inc-detail-top'><span class='inc-emoji-lg'>"+inc.emoji+"</span><div style='flex:1'><div style='display:flex;align-items:center;margin-bottom:3px'><div class='inc-title'>"+inc.title+"</div><span class='sev-badge' style='background:"+inc.sc+"'>"+inc.sev.toUpperCase()+"</span></div><div class='inc-addr-text'>&#128205; "+inc.addr+" &middot; "+inc.time+"</div></div><button class='close-btn' onclick='selectInc("+id+")'>&#10005;</button></div><p class='inc-desc-text'>"+inc.desc+"</p><div style='display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:10px;color:#888;'><div class='trust-bar'><div class='trust-fill' style='width:"+trustPct+"%'></div></div>"+inc.trust+"/5 verified</div><div class='inc-verify'><button class='verify-btn vb-confirm' onclick='verifyInc("+id+",1)'>&#10003; Confirm</button><button class='verify-btn vb-still' onclick='verifyInc("+id+",2)'>&#128337; Still there</button><button class='verify-btn vb-resolved' onclick='verifyInc("+id+",3)'>&#9989; Resolved</button><button class='verify-btn vb-notthere' onclick='verifyInc("+id+",4)'>&#10007; Not there</button></div><div class='tags' style='margin-top:8px;'><span class='tag'>By: "+inc.rep+"</span><span class='tag' style='background:#e8f5e9;color:#2e7d32;'>&#10003; "+inc.status+"</span></div>";
}

function verifyInc(id,action){
  var inc=INCS[id];
  if(action===1){inc.trust=Math.min(5,inc.trust+1);showPush({icon:"&#10003;",title:"Thanks for verifying!",body:"Your confirmation helps neighbours stay safe.",color:"#2e7d32"});}
  else if(action===2){showPush({icon:"&#128337;",title:"Still active",body:"Marked as still ongoing.",color:"#f57f17"});}
  else if(action===3){inc.status="Resolved";inc.trust=5;showPush({icon:"&#9989;",title:"Marked resolved",body:"Thanks for letting neighbours know.",color:"#1565c0"});}
  else{inc.trust=Math.max(0,inc.trust-1);showPush({icon:"&#10007;",title:"Noted",body:"Recorded that you could not confirm this.",color:"#555"});}
  selectInc(id);
}

function openReport(){document.getElementById("reportModal").style.display="flex";}
function closeReport(){document.getElementById("reportModal").style.display="none";document.getElementById("reportForm").style.display="block";document.getElementById("reportSuccess").style.display="none";document.getElementById("reportDesc").value="";document.querySelectorAll(".type-btn").forEach(function(b,i){b.className=i===0?"type-btn active":"type-btn";});}
function setType(b){document.querySelectorAll(".type-btn").forEach(function(x){x.className="type-btn";});b.className="type-btn active";}

async function submitReport(){
  var desc=document.getElementById("reportDesc").value.trim();if(!desc)return;
  var activeType=document.querySelector(".type-btn.active");
  var type=activeType?activeType.textContent.trim():"General";
  try{var res=await fetch("/api/incidents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:userPhone,address:userAddress,type:type,description:desc})});if(res.ok){document.getElementById("reportForm").style.display="none";document.getElementById("reportSuccess").style.display="block";setTimeout(function(){closeReport();showPush({icon:"&#128680;",title:"Incident Reported",body:"Submitted. Neighbours being notified.",color:"#e65100"});},2000);}}catch(e){}
}

var pT;
function showPush(n){var b=document.getElementById("pushBanner");document.getElementById("pushIcon").innerHTML=n.icon;document.getElementById("pushTitle").textContent=n.title;document.getElementById("pushBodyText").textContent=n.body;b.style.background=n.color||"#2d4a2d";b.style.display="flex";clearTimeout(pT);pT=setTimeout(dismissPush,5000);}
function dismissPush(){document.getElementById("pushBanner").style.display="none";}

function markNotifRead(card){card.classList.add("read");var dot=card.querySelector(".unread-dot");if(dot)dot.style.display="none";updateNotifBadge();}
function markNotifsRead(){document.querySelectorAll(".notif-card").forEach(function(c){markNotifRead(c);});}
function updateNotifBadge(){var unread=document.querySelectorAll(".notif-card:not(.read)").length;var b=document.getElementById("notifBadge");var tb=document.getElementById("tabNotifBadge");if(unread>0){if(b){b.textContent=unread;b.style.display="flex";}if(tb){tb.textContent=unread;tb.style.display="flex";}}else{if(b)b.style.display="none";if(tb)tb.style.display="none";}}

var LOCAL_LISTINGS=[
  {emoji:"&#127818;",title:"Fruit Kart",location:"Summerstone Estate",desc:"Mangoes $1, bananas 50c. Cash only. 7am til sold out.",tags:["Fresh produce","Cash"],badge:"OPEN NOW",badgeColor:"#2e7d32",estate:"summerstone"},
  {emoji:"&#128210;",title:"Bookkeeper",location:"Summerstone Estate",desc:"BAS, payroll, Xero. Tradies welcome. First consult free.",tags:["Paid","Tax"],badge:"NEIGHBOUR RATE",badgeColor:"#bf360c",estate:"summerstone"},
  {emoji:"&#127939;",title:"Run Club",location:"Summerstone Estate",desc:"Saturday 5km. All paces welcome. Just show up!",tags:["Free","Sat 6am"],badge:"SAT 6AM",badgeColor:"#6a1b9a",estate:"summerstone"},
  {emoji:"&#129370;",title:"Fresh Eggs $5/dozen",location:"Summerstone Estate",desc:"Free range, collected daily. Cash in letterbox.",tags:["$5/dozen","Cash"],badge:"AVAILABLE",badgeColor:"#e65100",estate:"summerstone"},
  {emoji:"&#128170;",title:"Boot Camp",location:"Summerstone Estate",desc:"Free workout Tue & Thu 5:30pm. All levels.",tags:["Free","Tue & Thu"],badge:"TUE & THU",badgeColor:"#00695c",estate:"summerstone"}
];

function renderLocalTab(){
  var container=document.getElementById("localListings");if(!container)return;
  var ek=getEstateFromAddress(userAddress);
  var filtered=LOCAL_LISTINGS.filter(function(l){return!userAddress||l.estate===ek;});
  var estate=ESTATES[ek]||ESTATES.default;
  var lt=document.getElementById("localTitle");
  if(lt)lt.innerHTML="&#127960; LOCAL &mdash; "+(estate.name||"YOUR AREA").toUpperCase();
  if(filtered.length===0){container.innerHTML="<div class='empty-state'>&#127960;<br/>No local listings for your area yet.<br/><strong>Be the first to add one!</strong></div>";return;}
  container.innerHTML=filtered.map(function(item){return"<div class='local-card'><div class='local-top'><span class='local-emoji'>"+item.emoji+"</span><div style='flex:1;'><div class='local-title'>"+item.title+"</div><div class='local-addr'>&#128205; "+item.location+"</div></div><span class='local-badge' style='background:"+item.badgeColor+";'>"+item.badge+"</span></div><p class='local-desc'>"+item.desc+"</p><div class='tags'>"+item.tags.map(function(t){return"<span class='tag'>"+t+"</span>";}).join("")+"</div></div>";}).join("");
}

function addListing(){
  if(!isLoggedIn){alert("Please sign up first.");window.location.href="/signup.html";return;}
  var title=prompt("What are you offering?");if(!title||!title.trim())return;
  var desc=prompt("Describe it:");if(!desc||!desc.trim())return;
  var price=prompt("Price? (e.g. Free, $5)");
  var ek=getEstateFromAddress(userAddress);
  LOCAL_LISTINGS.push({emoji:"&#127960;",title:title.trim(),location:(ESTATES[ek]||ESTATES.default).name||userSuburb||"Local",desc:desc.trim(),tags:[price||"Free"],badge:"NEW",badgeColor:"#313131",estate:ek});
  renderLocalTab();
  showPush({icon:"&#127960;",title:"Listing Added!",body:title.trim()+" added.",color:"#313131"});
}

function toggleInterest(btn){btn.classList.toggle("selected");var interests=[];document.querySelectorAll(".interest-tag.selected").forEach(function(b){interests.push(b.textContent);});localStorage.setItem("sc_interests",JSON.stringify(interests));}

function editDisplayName(){
  var newName=prompt("Enter your display name:",userDisplay);
  if(newName&&newName.trim()){
    userDisplay=newName.trim();
    localStorage.setItem("sc_display",userDisplay);
    var mt=document.getElementById("myAddrText");if(mt)mt.textContent=userDisplay;
    var pn=document.getElementById("profileName");if(pn)pn.textContent=userDisplay;
    var av=document.getElementById("profileAvatar");if(av)av.textContent=userDisplay.charAt(0).toUpperCase();
    showPush({icon:"&#128100;",title:"Display name updated",body:"You now appear as "+userDisplay,color:"#313131"});
  }
}

function toggleInterest(btn, interest){
  btn.classList.toggle('selected');
}

function saveProfile(){
  var newName = document.getElementById('editDisplayName').value.trim();
  var newBio = document.getElementById('editBio').value.trim();
  var interests = [];
  document.querySelectorAll('.interest-tag.selected').forEach(function(t){interests.push(t.textContent.trim());});
  
  if(newName){
    userDisplay = newName;
    localStorage.setItem('sc_display', newName);
  }
  if(newBio) localStorage.setItem('sc_bio', newBio);
  if(interests.length) localStorage.setItem('sc_interests', JSON.stringify(interests));
  
    var mt = document.getElementById('myAddrText');
  if(mt) mt.textContent = userDisplay;
  
  showPush({icon:'&#10003;',title:'Profile updated!',body:'Your changes have been saved.',color:'var(--ec)'});
  closeProfile();
}

function openProfile(){
  var ek=getEstateFromAddress(userAddress);
  var estate=ESTATES[ek]||ESTATES.default;
  var council=getCouncilFromSuburb(userSuburb);
  var av=document.getElementById("profileAvatar");if(av)av.textContent=userDisplay.charAt(0).toUpperCase()||"T";
  var pn=document.getElementById("profileName");if(pn)pn.textContent=userDisplay;
  var pa=document.getElementById("profileAddress");if(pa)pa.textContent=userAddress||"Not set";
  var pe=document.getElementById("profileEstate");if(pe)pe.textContent=(estate.name||"Unknown")+" · "+(userSuburb||"");
  var pc=document.getElementById("profileCouncil");if(pc)pc.textContent=council;
  var interests=JSON.parse(localStorage.getItem("sc_interests")||"[]");
  document.querySelectorAll(".interest-tag").forEach(function(b){b.classList.toggle("selected",interests.indexOf(b.textContent)!==-1);});
  document.getElementById("profileModal").style.display="flex";
}
function closeProfile(){document.getElementById("profileModal").style.display="none";}
function logout(){if(!confirm("Logout?"))return;["sc_address","sc_phone","sc_suburb","sc_display","sc_welcomed","sc_interests"].forEach(function(k){localStorage.removeItem(k);});closeProfile();location.reload();}

function openSettings(){document.getElementById("settingsModal").style.display="flex";}
function closeSettings(){document.getElementById("settingsModal").style.display="none";}
function toggleSetting(el){el.classList.toggle("on");}

function applyEstateBranding(){
  var ek=getEstateFromAddress(userAddress);
  var estate=ESTATES[ek]||ESTATES.default;
  var council=getCouncilFromSuburb(userSuburb);
  document.documentElement.style.setProperty("--ec",estate.color);
  document.documentElement.style.setProperty("--ea",estate.accent);
  var header=document.getElementById("mainHeader");if(header)header.style.background=estate.color;
  var logo=document.getElementById("estateLogo");
  var placeholder=document.getElementById("estatePlaceholder");
  if(logo&&estate.logo){
    logo.src=estate.logo;
    logo.style.display="block";
    logo.style.maxWidth="220px";
    logo.style.maxHeight="90px";
    logo.style.objectFit="contain";
    if(placeholder)placeholder.style.display="none";
  }
  else if(estate.seriesM){
    if(logo)logo.style.display="none";
    if(placeholder){
      placeholder.style.display="flex";placeholder.style.flexDirection="column";placeholder.style.alignItems="center";
      var mImg=document.createElement("img");mImg.src="/montrose-m.png";mImg.style.cssText="height:60px;object-fit:contain;margin-bottom:6px;";
      var nameDiv=document.createElement("div");nameDiv.style.cssText="font-size:20px;font-weight:300;color:#d4dde8;letter-spacing:7px;font-family:Georgia,serif;";nameDiv.textContent="MONTROSE";
      var subDiv=document.createElement("div");subDiv.style.cssText="font-size:9px;color:rgba(184,197,214,0.5);letter-spacing:4px;margin-top:3px;";subDiv.textContent="MORAYFIELD";
      placeholder.innerHTML="";placeholder.appendChild(mImg);placeholder.appendChild(nameDiv);placeholder.appendChild(subDiv);
    }
  } else {if(logo)logo.style.display="none";if(placeholder){placeholder.style.display="flex";placeholder.innerHTML="&#127960;";}}
  var hStreet=document.getElementById("hStreet");var hSuburb=document.getElementById("hSuburb");var hEstate=document.getElementById("hEstate");var hCouncil=document.getElementById("hCouncil");var composeLocation=document.getElementById("composeLocation");
  if(hStreet)hStreet.textContent=userDisplay||"";
  if(hSuburb)hSuburb.textContent=userSuburb||"";
  if(hEstate)hEstate.textContent=(estate.name||council).toUpperCase();
  if(hCouncil)hCouncil.textContent=council.toUpperCase()+" · STREET CONNECT";
  if(composeLocation)composeLocation.textContent=estate.name||council;
  var boundary=document.getElementById("estateBoundary");
  if(boundary&&estate.boundary){boundary.setAttribute("points",estate.boundary);boundary.setAttribute("display","");}else if(boundary){boundary.setAttribute("display","none");}
    var COUNCIL_COLORS={"Moreton Bay City":{"c":"#2a3a00","a":"#b5cc18"},"Ipswich City":{"c":"#1a3020","a":"#69f0ae"},"Logan City":{"c":"#1a5c1a","a":"#81c784"},"Brisbane City":{"c":"#4a1a5c","a":"#ce93d8"}};
  if(ek==="default"&&COUNCIL_COLORS[council]){
    var cc=COUNCIL_COLORS[council];
    document.documentElement.style.setProperty("--ec",cc.c);
    document.documentElement.style.setProperty("--ea",cc.a);
    if(header)header.style.background=cc.c;
    if(placeholder){
      placeholder.style.display="flex";placeholder.style.flexDirection="column";placeholder.style.alignItems="center";
      var councilIcons={
        "Moreton Bay City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(181,204,24,0.15)' stroke='rgba(181,204,24,0.4)' stroke-width='1.5'/><path d='M15 42 L15 28 L22 22 L30 18 L38 22 L45 28 L45 42 Z' fill='none' stroke='rgba(79,195,247,0.8)' stroke-width='1.5' stroke-linejoin='round'/><path d='M25 42 L25 34 L35 34 L35 42' fill='none' stroke='rgba(79,195,247,0.8)' stroke-width='1.5'/><path d='M10 42 L50 42' stroke='rgba(79,195,247,0.6)' stroke-width='1.5'/><circle cx='30' cy='26' r='3' fill='rgba(79,195,247,0.6)'/><path d='M20 42 L20 30' stroke='rgba(79,195,247,0.4)' stroke-width='1'/><path d='M40 42 L40 30' stroke='rgba(79,195,247,0.4)' stroke-width='1'/></svg>",
        "Ipswich City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(255,138,101,0.15)' stroke='rgba(255,138,101,0.4)' stroke-width='1.5'/><path d='M18 42 L18 24 L30 16 L42 24 L42 42 Z' fill='none' stroke='rgba(255,138,101,0.8)' stroke-width='1.5' stroke-linejoin='round'/><rect x='26' y='32' width='8' height='10' fill='none' stroke='rgba(255,138,101,0.8)' stroke-width='1.5'/><rect x='20' y='28' width='6' height='6' fill='none' stroke='rgba(255,138,101,0.5)' stroke-width='1'/><rect x='34' y='28' width='6' height='6' fill='none' stroke='rgba(255,138,101,0.5)' stroke-width='1'/><path d='M10 42 L50 42' stroke='rgba(255,138,101,0.6)' stroke-width='1.5'/><path d='M30 16 L30 10 M27 13 L33 13' stroke='rgba(255,138,101,0.5)' stroke-width='1.5' stroke-linecap='round'/></svg>",
        "Logan City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(129,199,132,0.15)' stroke='rgba(129,199,132,0.4)' stroke-width='1.5'/><path d='M30 12 C18 18 12 26 12 34 C12 42 20 48 30 48 C40 48 48 42 48 34 C48 26 42 18 30 12Z' fill='none' stroke='rgba(129,199,132,0.5)' stroke-width='1'/><path d='M30 18 C22 22 18 28 18 34 C18 40 24 44 30 44 C36 44 42 40 42 34 C42 28 38 22 30 18Z' fill='none' stroke='rgba(129,199,132,0.7)' stroke-width='1.5'/><circle cx='30' cy='34' r='5' fill='rgba(129,199,132,0.4)' stroke='rgba(129,199,132,0.8)' stroke-width='1.5'/><path d='M30 18 L30 12 M22 20 L18 16 M38 20 L42 16' stroke='rgba(129,199,132,0.5)' stroke-width='1' stroke-linecap='round'/></svg>",
        "Brisbane City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(206,147,216,0.15)' stroke='rgba(206,147,216,0.4)' stroke-width='1.5'/><rect x='16' y='30' width='8' height='12' fill='none' stroke='rgba(206,147,216,0.6)' stroke-width='1.5'/><rect x='26' y='22' width='8' height='20' fill='none' stroke='rgba(206,147,216,0.8)' stroke-width='1.5'/><rect x='36' y='26' width='8' height='16' fill='none' stroke='rgba(206,147,216,0.6)' stroke-width='1.5'/><path d='M10 42 L50 42' stroke='rgba(206,147,216,0.6)' stroke-width='1.5'/><path d='M20 30 L20 24 M30 22 L30 14 M40 26 L40 18' stroke='rgba(206,147,216,0.4)' stroke-width='1' stroke-dasharray='2,2'/></svg>",
        "Greater Brisbane":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(105,240,174,0.1)' stroke='rgba(105,240,174,0.3)' stroke-width='1.5'/><path d='M20 38 C20 32 24 26 30 24 C36 26 40 32 40 38' fill='none' stroke='rgba(105,240,174,0.6)' stroke-width='1.5'/><circle cx='30' cy='24' r='4' fill='none' stroke='rgba(105,240,174,0.8)' stroke-width='1.5'/><path d='M15 38 L45 38' stroke='rgba(105,240,174,0.5)' stroke-width='1.5'/><path d='M22 38 L22 42 M30 38 L30 44 M38 38 L38 42' stroke='rgba(105,240,174,0.4)' stroke-width='1' stroke-linecap='round'/></svg>"
      };
      var icon=councilIcons[council]||councilIcons["Greater Brisbane"];
      placeholder.innerHTML=icon+"<div style='font-size:9px;color:rgba(255,255,255,0.55);letter-spacing:2px;font-weight:700;text-align:center;margin-top:6px;'>"+council.toUpperCase()+"</div>";
    }
  }

  var binKey=(userSuburb||"").toLowerCase();
  var binText=BIN_SCHEDULES[binKey]||estate.binDay||"Check your council website for bin day.";
  var pt=document.getElementById("pinnedBinTitle");var pb=document.getElementById("pinnedBinBody");
  if(pt)pt.innerHTML="&#128721; Bin Day &mdash; "+(userSuburb||"Your Area");
  if(pb)pb.innerHTML=binText;
    var splash=document.getElementById("splashScreen");
  var splashLogo=document.getElementById("splashLogo");
  var splashText=document.getElementById("splashText");
  if(splash&&isLoggedIn&&!localStorage.getItem("sc_splashed")){
    if(estate.logo&&splashLogo){splashLogo.src=estate.logo;splashLogo.style.display="block";}
    if(splashText)splashText.textContent="Welcome to "+(estate.name||"Street Connect");
    splash.style.display="flex";
    localStorage.setItem("sc_splashed","1");
    setTimeout(function(){splash.style.opacity="0";setTimeout(function(){splash.style.display="none";},500);},2500);
  } else if(splash){splash.style.display="none";}
}

function updateHeader(){
  var jw=document.getElementById("joinBtnWrap");var mb=document.getElementById("myAddrBtn");var mt=document.getElementById("myAddrText");
  if(isLoggedIn&&userAddress){if(jw)jw.style.display="none";if(mb)mb.style.display="block";if(mt)mt.textContent=userDisplay;}
  else{if(jw)jw.style.display="block";if(mb)mb.style.display="none";}
}

async function updateNeighbourCount(){
  try{var res=await fetch("/api/get-users?password=count_only");if(res.ok){var data=await res.json();var count=data.total||0;var el=document.getElementById("neighbourCount");if(el)el.textContent=count+" neighbour"+(count===1?"":"s")+" active";}}
  catch(e){var el=document.getElementById("neighbourCount");if(el)el.textContent="community growing";}
}

function messageAdmin(){
  var msg=prompt("Message to Street Connect support:");
  if(msg&&msg.trim()){fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:userPhone,address:userAddress,suburb:"ADMIN_MSG",content:"[SUPPORT] "+msg.trim(),display_name:userDisplay})}).then(function(){alert("Message sent! We will get back to you soon.");});}
}

var settings={darkMode:localStorage.getItem("sc_darkmode")==="1",quietHours:localStorage.getItem("sc_quiet")==="1"};

window.addEventListener("online",function(){var b=document.getElementById("offlineBanner");if(b)b.style.display="none";loadMessages();});
window.addEventListener("offline",function(){var b=document.getElementById("offlineBanner");if(b)b.style.display="block";});

function scrollToBottom(){document.getElementById("chatBottom").scrollIntoView({behavior:"smooth"});var banner=document.getElementById("newMsgBanner");if(banner)banner.style.display="none";}

var currentDM = null;
var dmMessages = {};

// ── PROFILE PHOTO ────────────────────────────────────────────────────────────
var userPhoto = localStorage.getItem("sc_photo") || "";

function handlePhotoUpload(event){
  var file = event.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var img = new Image();
    img.onload = function(){
      var canvas = document.createElement('canvas');
      var maxSize = 150;
      var w = img.width, h = img.height;
      if(w > h){ h = Math.round(h*(maxSize/w)); w = maxSize; } else { w = Math.round(w*(maxSize/h)); h = maxSize; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      var compressed = canvas.toDataURL('image/jpeg', 0.8);
      userPhoto = compressed;
      localStorage.setItem("sc_photo", compressed);
      updatePhotoDisplay();
      showPush({icon:"&#128247;",title:"Photo updated!",body:"Your profile photo has been saved.",color:"var(--ec)"});
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updatePhotoDisplay(){
  var avatarImg = document.getElementById("profileAvatarImg");
  var avatarText = document.getElementById("profileAvatarText");
  if(userPhoto && avatarImg){
    avatarImg.src = userPhoto;
    avatarImg.style.display = "block";
    if(avatarText) avatarText.style.display = "none";
  } else if(avatarImg){
    avatarImg.style.display = "none";
    if(avatarText) avatarText.style.display = "block";
  }
  var headerImg = document.getElementById("headerAvatarImg");
  var headerText = document.getElementById("headerAvatarText");
  if(userPhoto && headerImg){
    headerImg.src = userPhoto;
    headerImg.style.display = "inline-block";
    if(headerText) headerText.style.display = "none";
  } else if(headerImg){
    headerImg.style.display = "none";
    if(headerText) headerText.style.display = "inline";
  }
}

function openDM(neighbourName, neighbourPhone){
  if(!isLoggedIn){alert("Please sign up to send messages.");return;}
  if(!neighbourPhone||neighbourPhone==="demo"||neighbourPhone===userPhone)return;
  
  currentDM = {name:neighbourName, phone:neighbourPhone};
  if(!dmMessages[neighbourPhone])dmMessages[neighbourPhone]=[];
  
    var list=document.getElementById("dmList");
  if(list){
    var existing=document.getElementById("dm_"+neighbourPhone);
    if(!existing){
      var item=document.createElement("div");
      item.className="dm-item";
      item.id="dm_"+neighbourPhone;
      item.onclick=function(){openDMConvo(neighbourName,neighbourPhone);};
      item.innerHTML="<div class='dm-avatar'>"+neighbourName.charAt(0).toUpperCase()+"</div>"+
        "<div style='flex:1'><div class='dm-name'>"+neighbourName+"</div>"+
        "<div class='dm-preview'>Tap to open conversation</div></div>";
      list.innerHTML="";
      list.appendChild(item);
    }
  }
  
  switchTab("dms",null);
  openDMConvo(neighbourName, neighbourPhone);
}

// ── PROFILE PHOTO ────────────────────────────────────────────────────────────
var userPhoto = localStorage.getItem("sc_photo") || "";

function handlePhotoUpload(event){
  var file = event.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var img = new Image();
    img.onload = function(){
      var canvas = document.createElement('canvas');
      var maxSize = 150;
      var w = img.width, h = img.height;
      if(w > h){ h = Math.round(h*(maxSize/w)); w = maxSize; } else { w = Math.round(w*(maxSize/h)); h = maxSize; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      var compressed = canvas.toDataURL('image/jpeg', 0.8);
      userPhoto = compressed;
      localStorage.setItem("sc_photo", compressed);
      updatePhotoDisplay();
      showPush({icon:"&#128247;",title:"Photo updated!",body:"Your profile photo has been saved.",color:"var(--ec)"});
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updatePhotoDisplay(){
  var avatarImg = document.getElementById("profileAvatarImg");
  var avatarText = document.getElementById("profileAvatarText");
  if(userPhoto && avatarImg){
    avatarImg.src = userPhoto;
    avatarImg.style.display = "block";
    if(avatarText) avatarText.style.display = "none";
  } else if(avatarImg){
    avatarImg.style.display = "none";
    if(avatarText) avatarText.style.display = "block";
  }
  var headerImg = document.getElementById("headerAvatarImg");
  var headerText = document.getElementById("headerAvatarText");
  if(userPhoto && headerImg){
    headerImg.src = userPhoto;
    headerImg.style.display = "inline-block";
    if(headerText) headerText.style.display = "none";
  } else if(headerImg){
    headerImg.style.display = "none";
    if(headerText) headerText.style.display = "inline";
  }
}

function openDMConvo(name, phone){
  currentDM={name:name,phone:phone};
  document.getElementById("dmInbox").style.display="none";
  var convo=document.getElementById("dmConvo");
  convo.style.display="flex";
  convo.style.flexDirection="column";
  document.getElementById("dmConvoName").textContent=name;
  renderDMMessages(phone);
}

function closeDMConvo(){
  document.getElementById("dmConvo").style.display="none";
  document.getElementById("dmInbox").style.display="flex";
  document.getElementById("dmInbox").style.flexDirection="column";
}

function renderDMMessages(phone){
  var msgs=dmMessages[phone]||[];
  var container=document.getElementById("dmMessages");
  if(!msgs.length){
    container.innerHTML="<div class='empty-state'>&#128172;<br/>Start the conversation!</div>";
    return;
  }
  container.innerHTML=msgs.map(function(m){
    var isMe=m.from==="me";
    return "<div class='msg-row"+(isMe?" me":"")+"'>"+
      (isMe?"":"<div class='msg-av'>&#127968;</div>")+
      "<div style='max-width:75%'>"+
      (isMe?"":"<div class='msg-meta'>"+currentDM.name+" &middot; "+m.time+"</div>")+
      "<div class='bubble "+(isMe?"me":"them")+"'><p>"+m.text+"</p></div>"+
      "</div>"+
      (isMe?"<div class='msg-av'>&#127968;</div>":"")+
      "</div>";
  }).join("");
  container.scrollTop=container.scrollHeight;
}

function sendDM(){
  var input=document.getElementById("dmInput");
  var text=input.value.trim();
  if(!text||!currentDM)return;
  input.value="";
  var n=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  if(!dmMessages[currentDM.phone])dmMessages[currentDM.phone]=[];
  dmMessages[currentDM.phone].push({from:"me",text:text,time:n});
  renderDMMessages(currentDM.phone);
  showPush({icon:"&#128172;",title:"Message sent",body:"Your private message was delivered.",color:"var(--ec)"});
}

var msgReactions={};
function addReaction(msgId,emoji){
  if(!msgReactions[msgId])msgReactions[msgId]={};
  if(msgReactions[msgId][emoji])delete msgReactions[msgId][emoji];
  else msgReactions[msgId][emoji]=true;
  loadMessages();
}

function showWelcomeSplash(){
  var splash=document.getElementById("welcomeSplash");
  var wLogo=document.getElementById("welcomeLogo");
  var wName=document.getElementById("welcomeEstateName");
  var ek=getEstateFromAddress(userAddress);
  var estate=ESTATES[ek]||ESTATES.default;
  if(!splash)return;
  if(estate.logo&&wLogo){wLogo.src=estate.logo;wLogo.style.display="block";}
  if(wName)wName.textContent=estate.name||"Street Connect";
  splash.style.display="flex";
  setTimeout(function(){
    splash.style.opacity="0";
    splash.style.transition="opacity 0.5s";
    setTimeout(function(){splash.style.display="none";splash.style.opacity="1";},500);
  },2500);
}

updateHeader();
applyEstateBranding();
updatePhotoDisplay();
updateNeighbourCount();
renderLocalTab();
updateRadius(500);
updateNotifBadge();

if(!navigator.onLine){var b=document.getElementById("offlineBanner");if(b)b.style.display="block";}

if(isLoggedIn&&!localStorage.getItem("sc_welcomed")){
  showWelcomeSplash();
  var ek2=getEstateFromAddress(userAddress);
  var estate2=ESTATES[ek2]||ESTATES.default;
  setTimeout(function(){showPush({icon:"&#127881;",title:"Welcome to Street Connect!",body:"You are now connected with your neighbours. Say hello!",color:estate2.color});localStorage.setItem("sc_welcomed","1");},3000);
}
