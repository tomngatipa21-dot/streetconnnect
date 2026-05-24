var ESTATE_LOOKUP={"Amber Street":"summerstone","Amber St":"summerstone","Summerstone Boulevard":"summerstone","Summerstone Blvd":"summerstone","Breeze Street":"summerstone","Festival Street":"summerstone","Tropic Street":"summerstone","Dune Street":"summerstone","Sunrise Street":"summerstone","Island Parade":"summerstone","Sunset Street":"summerstone","Golden Road":"summerstone","Pocketstone Court":"summerstone","Moreton Parade":"summerstone","Bloom Drive":"summerstone","Harvest Street":"summerstone","Essence Street":"summerstone","Freshwater Street":"summerstone","Kingfisher Avenue":"summerstone","Baird Road":"montrose","Blaven Street":"montrose","Carisbrooke Street":"montrose","Culbin Way":"montrose","Earsland Circuit":"montrose","Glenelg Street":"montrose","Glenmore Street":"montrose","Grandtown Drive":"montrose","Hepworth Way":"montrose","Leask Street":"montrose","MacRae Street":"montrose","Mosset Street":"montrose","Randolph Boulevard":"montrose","Roysvale Way":"montrose","Semaphore Street":"montrose","Thornhill Road":"montrose","Varis Street":"montrose","Wellside Street":"montrose"};
var ESTATES={summerstone:{name:"Summerstone Estate",suburb:"Morayfield",council:"Moreton Bay City",color:"#313131",accent:"#c9a84c",logo:"/summerstone.png",boundary:[{lat:-27.0945,lng:152.9548},{lat:-27.0945,lng:152.9628},{lat:-27.1058,lng:152.9628},{lat:-27.1058,lng:152.9548}],binDay:"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Green waste: Monday &middot; Put out: Tuesday night"},montrose:{name:"Montrose",suburb:"Morayfield",council:"Moreton Bay City",color:"#1a2a6b",accent:"#b8c5d6",logo:null,seriesM:true,boundary:[{lat:-27.132,lng:152.948},{lat:-27.132,lng:152.960},{lat:-27.138,lng:152.960},{lat:-27.138,lng:152.948}],binDay:"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Put out: Tuesday night"},default:{name:null,suburb:null,council:"Greater Brisbane",color:"#1a3020",accent:"#69f0ae",logo:null,boundary:null,binDay:"&#128721; Check moretonbay.qld.gov.au for your bin day schedule"}};
var BIN_SCHEDULES={"morayfield":"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Green waste: Monday &middot; Put out: Tuesday night","caboolture":"&#128721; General waste: Thursday &middot; Recycling: alternating Thursday &middot; Put out: Wednesday night","redcliffe":"&#128721; General waste: Tuesday &middot; Recycling: alternating Tuesday &middot; Put out: Monday night","narangba":"&#128721; General waste: Wednesday &middot; Recycling: alternating Wednesday &middot; Put out: Tuesday night","burpengary":"&#128721; General waste: Thursday &middot; Recycling: alternating Thursday &middot; Put out: Wednesday night"};
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
function switchTab(t,b){document.querySelectorAll(".content").forEach(function(e){e.style.display="none";});document.querySelectorAll(".tab").forEach(function(e){e.classList.remove("active");});document.getElementById("tab-"+t).style.display="flex";if(b&&b.classList)b.classList.add("active");}
function toggleScopePicker(){var p=document.getElementById("scopePicker");if(!p)return;p.style.display=(p.style.display==="none"||!p.style.display)?"block":"none";}
var SCOPE_LABELS={street:"My Street",estate:"My Estate",radius:"Radius"};
function setChatLevel(level,btn){currentChatLevel=level;document.querySelectorAll(".scope-seg-btn").forEach(function(b){b.classList.remove("active");});if(btn)btn.classList.add("active");var sv=document.getElementById("scopeStripValue");if(sv)sv.textContent=SCOPE_LABELS[level]||"My Street";loadMessages();}
function setFilter(t,b){/* official content now lives in the Official tab; this is a no-op kept for compatibility */}
function toggleLike(b,c){if(b.classList.contains("liked")){b.classList.remove("liked");b.textContent=c>1?"&#128077; "+(c-1):"&#128077;";}else{b.classList.add("liked");b.textContent="&#128077; "+(c+1);}}
function scrollToBottom(){document.getElementById("chatBottom").scrollIntoView({behavior:"smooth"});document.getElementById("newMsgsBanner").style.display="none";}
function sendMsg(){var i=document.getElementById("chatInput");if(!i.value.trim())return;if(!isLoggedIn){alert("Please sign up to post messages.");window.location.href="/signup.html";return;}var content=i.value.trim();i.value="";document.getElementById("sendBtn").style.background="#ccc";fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:userPhone,address:userAddress,suburb:userSuburb,content:content,display_name:userDisplay})}).then(function(){loadMessages();}).catch(function(){});var a=document.getElementById("aiNote");a.style.display="block";setTimeout(function(){a.style.display="none";},3000);}
async function loadMessages(){
  try{
    var res=await fetch("/api/messages");if(!res.ok)return;
    var data=await res.json();var msgs=data.messages||[];
    if(currentChatLevel==="street"&&userAddress){var myStreet=userAddress.split(",")[0].trim().replace(/^[0-9]+[a-zA-Z]?\s+/,"").toLowerCase();if(myStreet)msgs=msgs.filter(function(m){var mStreet=(m.address||"").split(",")[0].trim().replace(/^[0-9]+[a-zA-Z]?\s+/,"").toLowerCase();return mStreet.indexOf(myStreet)!==-1||myStreet.indexOf(mStreet)!==-1||m.suburb==="ADMIN_MSG";});}
    else if(currentChatLevel==="estate"){var myEstate=getEstateFromAddress(userAddress);if(myEstate!=="default")msgs=msgs.filter(function(m){return getEstateFromAddress(m.address||"")===myEstate||m.suburb==="ADMIN_MSG";});}
    var container=document.getElementById("myMessages");container.innerHTML="";
    msgs.forEach(function(msg){
      var isMe=msg.phone===userPhone;
      var n=new Date(msg.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
      var displayName=msg.display_name||"Neighbour";
      var rawStreet=(msg.address||"").split(",")[0].trim();
      var streetName=rawStreet.replace(/^[0-9]+[a-zA-Z]?\s+/,"");
      if(!streetName&&msg.suburb&&msg.suburb!=="ADMIN_MSG")streetName=msg.suburb;
      var d=document.createElement("div");d.className="msg-row"+(isMe?" me":"");d.dataset.type=isMe?"me":"neighbour";
      if(isMe){d.innerHTML="<div style='max-width:75%'><div class='msg-meta' style='text-align:right;'><span style='color:#888;font-size:10px;'>"+displayName+"</span><span style='color:#bbb;font-size:9px;'> &middot; "+n+"</span></div><div class='bubble me'><p>"+msg.content+"</p></div><button onclick='deleteMsg("+JSON.stringify(msg.id)+")' class='del-btn'>&#128465; delete</button></div><div class='msg-av' style='margin-bottom:22px;'>"+(userPhoto?"<img src='"+userPhoto+"' style='width:32px;height:32px;border-radius:50%;object-fit:cover;border:1.5px solid var(--ea);'/>":"&#127968;")+"</div>";}
      else{d.innerHTML="<div class='msg-av'>&#127968;</div><div style='max-width:75%'><div class='msg-meta'><strong style='color:#444;font-size:10px;'>"+displayName+"</strong>"+(streetName?"<span style='color:#aaa;font-size:9px;'> &middot; "+streetName+"</span>":"")+("<span style='color:#bbb;font-size:9px;'> &middot; "+n+"</span></div><div class='bubble them'><p>"+msg.content+"</p></div></div>");}
      container.appendChild(d);
    });
    var bottom=document.getElementById("chatBottom");if(bottom)bottom.scrollIntoView({behavior:"smooth"});
  }catch(e){console.log("msg error:",e);}
}
async function deleteMsg(id){if(!confirm("Delete this message?"))return;try{await fetch("/api/messages",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:id,phone:userPhone})});loadMessages();}catch(e){}}
async function deleteMessage(id){return deleteMsg(id);}
loadMessages();
setInterval(loadMessages,10000);

// PROFILE PHOTO
var userPhoto=localStorage.getItem("sc_photo")||"";
function handlePhotoUpload(event){var file=event.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){var img=new Image();img.onload=function(){var canvas=document.createElement('canvas');var maxSize=150;var w=img.width,h=img.height;if(w>h){h=Math.round(h*(maxSize/w));w=maxSize;}else{w=Math.round(w*(maxSize/h));h=maxSize;}canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);var compressed=canvas.toDataURL('image/jpeg',0.8);userPhoto=compressed;localStorage.setItem("sc_photo",compressed);updatePhotoDisplay();showPush({icon:"&#128247;",title:"Photo updated!",body:"Your profile photo has been saved.",color:"var(--ec)"});};img.src=e.target.result;};reader.readAsDataURL(file);}
function updatePhotoDisplay(){var avatarImg=document.getElementById("profileAvatarImg");var avatarText=document.getElementById("profileAvatarText");if(userPhoto&&avatarImg){avatarImg.src=userPhoto;avatarImg.style.display="block";if(avatarText)avatarText.style.display="none";}else if(avatarImg){avatarImg.style.display="none";if(avatarText)avatarText.style.display="block";}var headerImg=document.getElementById("headerAvatarImg");var headerText=document.getElementById("headerAvatarText");if(userPhoto&&headerImg){headerImg.src=userPhoto;headerImg.style.display="inline-block";if(headerText)headerText.style.display="none";}else if(headerImg){headerImg.style.display="none";if(headerText)headerText.style.display="inline";}}

// === REAL INCIDENTS (loaded from /api/incidents) ===
// INCS is now a dynamic map keyed by the incident's database id (uuid).
// INCIDENT_DISTS kept as an empty object so any legacy radius loop is harmless.
var INCS={};
var INCIDENT_DISTS={};
var INCIDENTS_LOADED=false;
// Map an incident type string (which includes an emoji + label) to display colour + severity.
function incidentStyleFor(type){
  var t=(type||"").toLowerCase();
  if(t.indexOf("theft")!==-1||t.indexOf("stolen")!==-1||t.indexOf("break")!==-1)return{color:"#e53935",sev:"high",sc:"#e53935"};
  if(t.indexOf("suspicious")!==-1||t.indexOf("vehicle")!==-1)return{color:"#fb8c00",sev:"medium",sc:"#fb8c00"};
  if(t.indexOf("safety")!==-1)return{color:"#e53935",sev:"high",sc:"#e53935"};
  if(t.indexOf("animal")!==-1||t.indexOf("dog")!==-1)return{color:"#388e3c",sev:"medium",sc:"#fb8c00"};
  if(t.indexOf("scam")!==-1)return{color:"#fb8c00",sev:"medium",sc:"#fb8c00"};
  if(t.indexOf("vandal")!==-1||t.indexOf("graffiti")!==-1)return{color:"#7b1fa2",sev:"low",sc:"#43a047"};
  return{color:"#fb8c00",sev:"medium",sc:"#fb8c00"};
}
// Pull the leading emoji out of a type string like "&#128663; Suspicious" or "🚗 Suspicious".
function incidentEmojiFor(type){
  if(!type)return"&#9888;";
  var m=type.match(/^([^A-Za-z]+)/);
  var lead=m?m[1].trim():"";
  return lead||"&#9888;";
}
function incidentLabelFor(type){
  if(!type)return"Incident";
  return type.replace(/^([^A-Za-z]+)/,"").trim()||"Incident";
}
// Friendly relative time from an ISO timestamp.
function relativeTime(iso){
  if(!iso)return"";
  var then=new Date(iso).getTime();var now=Date.now();var mins=Math.floor((now-then)/60000);
  if(mins<1)return"Just now";
  if(mins<60)return mins+" min ago";
  var hrs=Math.floor(mins/60);
  if(hrs<24)return hrs+" hour"+(hrs===1?"":"s")+" ago";
  var days=Math.floor(hrs/24);
  if(days===1)return"Yesterday";
  return days+" days ago";
}

var googleMap=null,radiusCircle=null,estatePolygon=null,streetPolyline=null,userMarker=null,incidentMarkers=[]; var UNIT_COMPLEXES=[   {name:"Stone Park Residence",buildings:[{lat:-27.062766,lng:152.953559},{lat:-27.062752,lng:152.954087}],streets:["Kestrel St","Kestrel Street"],suburb:"Caboolture"} ]; var complexMarkers=[]; var reportMap=null,reportMarker=null,reportLatLng=null;
var INCIDENT_LOCATIONS=[]; // populated dynamically from real incidents

var SUMMERSTONE_STREETS={"Amber Street":[{lat:-27.1302835,lng:152.951904},{lat:-27.1304435,lng:152.9530382},{lat:-27.1304937,lng:152.9533944},{lat:-27.1306071,lng:152.954136},{lat:-27.1306455,lng:152.954412},{lat:-27.1306586,lng:152.9545066}],"Bloom Drive":[{lat:-27.1309864,lng:152.9517773},{lat:-27.1312064,lng:152.9533082},{lat:-27.1312208,lng:152.9534082},{lat:-27.1312678,lng:152.9537355},{lat:-27.1313131,lng:152.9539568},{lat:-27.1313393,lng:152.9541411},{lat:-27.1313561,lng:152.954259}],"Breeze Street":[{lat:-27.1308934,lng:152.9561622},{lat:-27.1309815,lng:152.9561466},{lat:-27.1315184,lng:152.9560515},{lat:-27.1316088,lng:152.9560355},{lat:-27.1322247,lng:152.9559264},{lat:-27.132327,lng:152.9558919}],"Dune Street":[{lat:-27.1307437,lng:152.9553501},{lat:-27.1307014,lng:152.9553275},{lat:-27.1306522,lng:152.9553235},{lat:-27.1300959,lng:152.9554218},{lat:-27.1299933,lng:152.95544},{lat:-27.1293982,lng:152.9555452},{lat:-27.1292711,lng:152.9555677},{lat:-27.1288219,lng:152.9556471},{lat:-27.1287792,lng:152.9556695},{lat:-27.1287481,lng:152.9557038}],"Festival Street":[{lat:-27.1313561,lng:152.954259},{lat:-27.1313727,lng:152.9543757},{lat:-27.1316088,lng:152.9560355}],"Freshwater Street":[{lat:-27.1292974,lng:152.9547471},{lat:-27.1292838,lng:152.9546538},{lat:-27.1292429,lng:152.9543725},{lat:-27.1286553,lng:152.9502633},{lat:-27.1287709,lng:152.9510737},{lat:-27.128785,lng:152.9511729},{lat:-27.1289856,lng:152.952579},{lat:-27.129085,lng:152.9532757},{lat:-27.1291373,lng:152.953643}],"Golden Road":[{lat:-27.1289626,lng:152.9571511},{lat:-27.1289289,lng:152.9571196},{lat:-27.1289067,lng:152.9570653},{lat:-27.1287287,lng:152.9558119},{lat:-27.1287305,lng:152.9557581},{lat:-27.1287481,lng:152.9557038}],"Harvest Street":[{lat:-27.1284406,lng:152.9537718},{lat:-27.1282999,lng:152.9528049},{lat:-27.1282855,lng:152.9527056},{lat:-27.12797,lng:152.9505368},{lat:-27.1279709,lng:152.9504786},{lat:-27.1279872,lng:152.9504276}],"Island Parade":[{lat:-27.1309492,lng:152.9567906},{lat:-27.1309117,lng:152.9568319},{lat:-27.1308689,lng:152.9568514},{lat:-27.13031,lng:152.9569497},{lat:-27.1302212,lng:152.9569653},{lat:-27.1296131,lng:152.9570724},{lat:-27.1295252,lng:152.9570878},{lat:-27.1290512,lng:152.9571712},{lat:-27.1290036,lng:152.9571708},{lat:-27.1289626,lng:152.9571511}],"Moreton Parade":[{lat:-27.1279872,lng:152.9504276},{lat:-27.1280179,lng:152.9503895},{lat:-27.128061,lng:152.9503689},{lat:-27.1285677,lng:152.9502789},{lat:-27.1286553,lng:152.9502633},{lat:-27.1290053,lng:152.9502011},{lat:-27.1290578,lng:152.9502013},{lat:-27.1291092,lng:152.9502168},{lat:-27.1291516,lng:152.9502453},{lat:-27.1297084,lng:152.9507623},{lat:-27.1297753,lng:152.9508118},{lat:-27.129847,lng:152.9508542},{lat:-27.1299978,lng:152.9509293},{lat:-27.1300637,lng:152.950978},{lat:-27.1301226,lng:152.9510432},{lat:-27.1301643,lng:152.9511264},{lat:-27.1301876,lng:152.9512236},{lat:-27.1302835,lng:152.951904}],"Summerstone Boulevard":[{lat:-27.128108,lng:152.9549573},{lat:-27.1281601,lng:152.9549481},{lat:-27.128241,lng:152.9549338},{lat:-27.1285678,lng:152.9548761},{lat:-27.1291552,lng:152.9547722},{lat:-27.1292974,lng:152.9547471},{lat:-27.1298945,lng:152.9546417},{lat:-27.1299844,lng:152.9546258},{lat:-27.1306586,lng:152.9545066},{lat:-27.1307497,lng:152.9544902},{lat:-27.1309649,lng:152.9544513},{lat:-27.1310254,lng:152.9544328},{lat:-27.1312452,lng:152.9543173},{lat:-27.1313561,lng:152.954259},{lat:-27.1314704,lng:152.9542036},{lat:-27.1316935,lng:152.9541095}],"Sunrise Street":[{lat:-27.1299844,lng:152.9546258},{lat:-27.1300005,lng:152.9547398},{lat:-27.1300817,lng:152.9553203},{lat:-27.1300959,lng:152.9554218},{lat:-27.13031,lng:152.9569497}],"Sunset Street":[{lat:-27.1293982,lng:152.9555452},{lat:-27.1296131,lng:152.9570724}],"Tide Street":[{lat:-27.129085,lng:152.9532757},{lat:-27.1297647,lng:152.9531569},{lat:-27.1304435,lng:152.9530382}],"Tropic Street":[{lat:-27.1309492,lng:152.9567906},{lat:-27.1309588,lng:152.956761},{lat:-27.1309664,lng:152.9567376},{lat:-27.1309655,lng:152.9566799},{lat:-27.1308934,lng:152.9561622},{lat:-27.1307923,lng:152.955437},{lat:-27.1307742,lng:152.9553874},{lat:-27.1307592,lng:152.9553691},{lat:-27.1307437,lng:152.9553501}]}; SUMMERSTONE_STREETS["Amber Street"]=[[{lat:-27.1302835,lng:152.951904},{lat:-27.1304435,lng:152.9530382},{lat:-27.1304937,lng:152.9533944}],[{lat:-27.1306071,lng:152.954136},{lat:-27.1306455,lng:152.954412},{lat:-27.1306586,lng:152.9545066}],[{lat:-27.1279872,lng:152.9504276},{lat:-27.1280179,lng:152.9503895},{lat:-27.128061,lng:152.9503689},{lat:-27.1285677,lng:152.9502789},{lat:-27.1286553,lng:152.9502633},{lat:-27.1290053,lng:152.9502011},{lat:-27.1290578,lng:152.9502013},{lat:-27.1291092,lng:152.9502168},{lat:-27.1291516,lng:152.9502453},{lat:-27.1297084,lng:152.9507623},{lat:-27.1297753,lng:152.9508118},{lat:-27.129847,lng:152.9508542},{lat:-27.1299978,lng:152.9509293},{lat:-27.1300637,lng:152.950978},{lat:-27.1301226,lng:152.9510432},{lat:-27.1301643,lng:152.9511264},{lat:-27.1301876,lng:152.9512236},{lat:-27.1302835,lng:152.951904}]];var streetDataCache={};var MONTROSE_STREETS={"MacRae Street":[{lat:-27.1343017,lng:152.956691},{lat:-27.1342545,lng:152.9566995},{lat:-27.1341635,lng:152.9567159},{lat:-27.1341158,lng:152.9567245},{lat:-27.1340872,lng:152.9567352},{lat:-27.1340585,lng:152.956756},{lat:-27.1340358,lng:152.9567822},{lat:-27.1336333,lng:152.9574148},{lat:-27.1335808,lng:152.9574772},{lat:-27.1335225,lng:152.9575323},{lat:-27.1332252,lng:152.9578132},{lat:-27.1330515,lng:152.9579774}],"Baird Road":[{lat:-27.1352619,lng:152.9510942},{lat:-27.1355761,lng:152.9532875},{lat:-27.1355826,lng:152.9533323}],"Thornhill Road":[{lat:-27.1361919,lng:152.9532294},{lat:-27.1361873,lng:152.9531974},{lat:-27.1358586,lng:152.9509105}],"Varis Street":[{lat:-27.1346908,lng:152.9518023},{lat:-27.1341901,lng:152.9518881},{lat:-27.1341453,lng:152.9519046},{lat:-27.1341146,lng:152.9519381},{lat:-27.1340967,lng:152.9519857},{lat:-27.134097,lng:152.9520444},{lat:-27.1343076,lng:152.9535008},{lat:-27.1343142,lng:152.9535465}],"Glenelg Street":[{lat:-27.1349248,lng:152.9534432},{lat:-27.1349295,lng:152.9534762},{lat:-27.1349772,lng:152.9538113}],"Semaphore Street":[{lat:-27.1361919,lng:152.9532294},{lat:-27.1361968,lng:152.9532625},{lat:-27.1362466,lng:152.9535966}],"Randolph Boulevard":[{lat:-27.1338604,lng:152.9536227},{lat:-27.133907,lng:152.9536149},{lat:-27.1343142,lng:152.9535465},{lat:-27.1349248,lng:152.9534432},{lat:-27.1355826,lng:152.9533323},{lat:-27.1361919,lng:152.9532294}],"Mosset Street":[{lat:-27.1349248,lng:152.9534432},{lat:-27.1349201,lng:152.9534105},{lat:-27.1346908,lng:152.9518023},{lat:-27.1346383,lng:152.9514308},{lat:-27.1346368,lng:152.9513765},{lat:-27.1346487,lng:152.9513266},{lat:-27.1346779,lng:152.9512836},{lat:-27.1347212,lng:152.9512558},{lat:-27.1352619,lng:152.9510942},{lat:-27.1358586,lng:152.9509105},{lat:-27.1359219,lng:152.9508937},{lat:-27.1361504,lng:152.9508495}],"Culbin Way":[{lat:-27.1370607,lng:152.958183},{lat:-27.1370191,lng:152.9581638},{lat:-27.136982,lng:152.9581595},{lat:-27.1368056,lng:152.9581746},{lat:-27.1364325,lng:152.9582407},{lat:-27.136398,lng:152.9582469}],"Hepworth Way":[{lat:-27.1358748,lng:152.9593184},{lat:-27.1365415,lng:152.9592475},{lat:-27.1371553,lng:152.9591807},{lat:-27.1371855,lng:152.959164},{lat:-27.1372135,lng:152.9591318}],"Blaven Street":[{lat:-27.1372135,lng:152.9591318},{lat:-27.1372299,lng:152.9590855},{lat:-27.1372278,lng:152.9590325},{lat:-27.1371034,lng:152.9585417},{lat:-27.1370983,lng:152.9584753},{lat:-27.1371004,lng:152.9582772},{lat:-27.1370888,lng:152.9582242},{lat:-27.1370607,lng:152.958183}],"Carisbrooke Street":[{lat:-27.1355471,lng:152.9574413},{lat:-27.1355743,lng:152.9574755},{lat:-27.1355871,lng:152.9574947},{lat:-27.1356071,lng:152.9575248},{lat:-27.1356281,lng:152.9575795},{lat:-27.1357139,lng:152.9581848},{lat:-27.1357284,lng:152.9582872},{lat:-27.1358632,lng:152.9592367},{lat:-27.1358692,lng:152.9592789},{lat:-27.1358748,lng:152.9593184}],"Wellside Street":[{lat:-27.1365415,lng:152.9592475},{lat:-27.136536,lng:152.9592091},{lat:-27.1365301,lng:152.9591675},{lat:-27.136398,lng:152.9582469},{lat:-27.1363818,lng:152.9581336},{lat:-27.136289,lng:152.9574869},{lat:-27.1362748,lng:152.9573883},{lat:-27.1361762,lng:152.9567009},{lat:-27.1361689,lng:152.9566501},{lat:-27.1361645,lng:152.9566189}],"Earsland Circuit":[{lat:-27.1357139,lng:152.9581848},{lat:-27.1356784,lng:152.9581913},{lat:-27.1351192,lng:152.9582935},{lat:-27.1350813,lng:152.958309},{lat:-27.135062,lng:152.9583276},{lat:-27.1350523,lng:152.9583369},{lat:-27.1350333,lng:152.9583801},{lat:-27.1350317,lng:152.9584332},{lat:-27.1351504,lng:152.9592764},{lat:-27.1351661,lng:152.9593226},{lat:-27.1351936,lng:152.9593571},{lat:-27.1352311,lng:152.9593779},{lat:-27.1352749,lng:152.9593827},{lat:-27.1358748,lng:152.9593184}],"Roysvale Way":[{lat:-27.1369417,lng:152.9564885},{lat:-27.1361645,lng:152.9566189},{lat:-27.1356081,lng:152.9567123},{lat:-27.1355674,lng:152.9567299},{lat:-27.1355391,lng:152.9567651},{lat:-27.1355226,lng:152.956809},{lat:-27.1355229,lng:152.9568583},{lat:-27.1355901,lng:152.9573109},{lat:-27.1355892,lng:152.9573615},{lat:-27.1355764,lng:152.9574081},{lat:-27.1355471,lng:152.9574413}],"Leask Street":[{lat:-27.1370734,lng:152.9574156},{lat:-27.136825,lng:152.9574304},{lat:-27.1365483,lng:152.957447},{lat:-27.136487,lng:152.9574531},{lat:-27.1363242,lng:152.9574809},{lat:-27.136289,lng:152.9574869}],"Glenmore Street":[{lat:-27.1344407,lng:152.9576522},{lat:-27.1344873,lng:152.957644},{lat:-27.1345782,lng:152.9576281},{lat:-27.1355035,lng:152.9574661},{lat:-27.1355471,lng:152.9574413}],"Grandtown Drive":[{lat:-27.1332147,lng:152.9492534},{lat:-27.1333365,lng:152.9492235},{lat:-27.1334888,lng:152.9492037},{lat:-27.1337021,lng:152.9492905},{lat:-27.1339575,lng:152.9492508},{lat:-27.1341822,lng:152.9491176},{lat:-27.1344997,lng:152.9490329},{lat:-27.1347457,lng:152.948975},{lat:-27.135472,lng:152.9489495},{lat:-27.1355843,lng:152.9489733},{lat:-27.1357359,lng:152.9491018},{lat:-27.1358381,lng:152.9492211},{lat:-27.135856,lng:152.9493505},{lat:-27.1358934,lng:152.9496494},{lat:-27.1358365,lng:152.949719},{lat:-27.1346392,lng:152.9499712},{lat:-27.133936,lng:152.950116},{lat:-27.1338547,lng:152.9501015},{lat:-27.1338103,lng:152.9500328},{lat:-27.1337021,lng:152.9492905}]};if(localStorage.getItem('sc_cache_v2')!=='4'){localStorage.removeItem('sc_streets_morayfield');localStorage.removeItem('sc_streets_caboolture');localStorage.removeItem('sc_streets_redcliffe');localStorage.removeItem('sc_streets_narangba');localStorage.removeItem('sc_streets_burpengary');localStorage.setItem('sc_cache_v2','4');}function getStreetData(lat,lng,suburb,callback){var ek2=getEstateFromAddress(localStorage.getItem('sc_address')||'');var cacheKey='sc_streets_'+ek2+'_'+suburb.toLowerCase().replace(/\s+/g,'_');var cached=localStorage.getItem(cacheKey);if(cached){try{var data=JSON.parse(cached);if(data&&Object.keys(data).length>0){streetDataCache[suburb]=data;callback(data);return;}}catch(e){}}var query='[out:json][timeout:10];way["highway"]["name"](around:2000,'+lat+','+lng+');out geom;';var url='/api/overpass?data='+encodeURIComponent(query);fetch(url).then(function(r){return r.json();}).then(function(data){var streets={};(data.elements||[]).forEach(function(el){var name=el.tags&&el.tags.name;if(!name||!el.geometry)return;if(!streets[name])streets[name]=[];streets[name].push(el.geometry.map(function(pt){return{lat:pt.lat,lng:pt.lon};}));});if(Object.keys(streets).length>0){try{localStorage.setItem(cacheKey,JSON.stringify(streets));}catch(e){}}streetDataCache[suburb]=streets;callback(streets);}).catch(function(e){console.log('Overpass error:',e);callback(streetDataCache[suburb]||SUMMERSTONE_STREETS||{});});} function initGoogleMap(){fetch("/api/maps-key").then(function(r){return r.json();}).then(function(d){var s=document.createElement("script");s.src="https://maps.googleapis.com/maps/api/js?key="+d.key+"&libraries=geometry&callback=onMapReady";s.async=true;document.head.appendChild(s);}).catch(function(e){console.log("Maps key error:",e);});}
function placeComplexMarkers(){   if(!googleMap)return;   complexMarkers.forEach(function(m){m.setMap(null);});   complexMarkers=[];   var buildingSVG='<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect width="36" height="36" rx="8" fill="#4fc3f7"/><rect x="8" y="14" width="20" height="16" rx="1" fill="#fff"/><rect x="11" y="17" width="4" height="4" fill="#4fc3f7"/><rect x="21" y="17" width="4" height="4" fill="#4fc3f7"/><rect x="11" y="24" width="4" height="4" fill="#4fc3f7"/><rect x="21" y="24" width="4" height="4" fill="#4fc3f7"/><polygon points="6,14 18,6 30,14" fill="#fff"/><rect x="15" y="24" width="6" height="6" fill="#fff"/></svg>';   var icon={url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(buildingSVG),scaledSize:new google.maps.Size(36,36),anchor:new google.maps.Point(18,36)};   UNIT_COMPLEXES.forEach(function(complex){     complex.buildings.forEach(function(pos){       var m=new google.maps.Marker({position:pos,map:googleMap,icon:icon,title:complex.name});       complexMarkers.push(m);     });   }); } function repositionIncidents(center){ /* real incidents have their own lat/lng — no scattering needed */ } function onMapReady(){
  var centre={lat:-27.1307,lng:152.9518};
  googleMap=new google.maps.Map(document.getElementById("googleMapWrap"),{center:centre,zoom:15,mapTypeId:"roadmap",disableDefaultUI:true,zoomControl:true});
  var isUnitAddress=userAddress&&/^\d+\/\d+/.test(userAddress.split(',')[0].trim()); var userIcon=isUnitAddress?{   url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect width="36" height="36" rx="8" fill="#4fc3f7"/><rect x="8" y="14" width="20" height="16" rx="1" fill="#fff"/><rect x="11" y="17" width="4" height="4" fill="#4fc3f7"/><rect x="21" y="17" width="4" height="4" fill="#4fc3f7"/><rect x="11" y="24" width="4" height="4" fill="#4fc3f7"/><rect x="21" y="24" width="4" height="4" fill="#4fc3f7"/><polygon points="6,14 18,6 30,14" fill="#fff"/><rect x="15" y="24" width="6" height="6" fill="#fff"/></svg>'),   scaledSize:new google.maps.Size(36,36),   anchor:new google.maps.Point(18,36) }:{path:google.maps.SymbolPath.CIRCLE,scale:8,fillColor:"#4fc3f7",fillOpacity:1,strokeColor:"#fff",strokeWeight:2}; userMarker=new google.maps.Marker({position:centre,map:googleMap,icon:userIcon,title:"You"});
  loadIncidents();
 placeComplexMarkers(); if(userAddress){var geocoder=new google.maps.Geocoder();geocoder.geocode({address:userAddress+", QLD, Australia"},function(results,status){if(status==="OK"){var loc=results[0].geometry.location;googleMap.setCenter(loc);if(userMarker)userMarker.setPosition(loc);repositionIncidents(loc);var suburb=userSuburb||"Morayfield";getStreetData(loc.lat(),loc.lng(),suburb,function(streets){streetDataCache[suburb]=streets;updateGoogleMapMode("street");});}});}else{updateGoogleMapMode("street");}
}
// Draw a 450m-per-side square centred on the user (for non-estate/non-complex "My Block" scope).
// 450m per side = 225m in each direction from centre.
function drawBlockSquare(){
  if(!googleMap||!userMarker)return null;
  var c=userMarker.getPosition();
  var half=225; // metres each direction
  // metres -> degrees: lat is ~111320 m/deg; lng scales by cos(lat)
  var dLat=half/111320;
  var dLng=half/(111320*Math.cos(c.lat()*Math.PI/180));
  var ek=getEstateFromAddress(userAddress);var estate=ESTATES[ek]||ESTATES.default;var ac=estate.accent||'#69f0ae';
  var bounds={north:c.lat()+dLat,south:c.lat()-dLat,east:c.lng()+dLng,west:c.lng()-dLng};
  var rect=new google.maps.Rectangle({map:googleMap,bounds:bounds,fillColor:ac,fillOpacity:0.12,strokeColor:ac,strokeOpacity:0.85,strokeWeight:2});
  googleMap.fitBounds(bounds);
  return rect;
}
function updateGoogleMapMode(mode){if(!googleMap)return;var ek=getEstateFromAddress(userAddress);var estate=ESTATES[ek]||ESTATES.default;var ac=estate.accent||'#c9a84c';if(radiusCircle){radiusCircle.setMap(null);radiusCircle=null;}if(estatePolygon){estatePolygon.setMap(null);estatePolygon=null;}if(streetPolyline){streetPolyline.setMap(null);streetPolyline=null;}if(window.estatePolylines){window.estatePolylines.forEach(function(p){p.setMap(null);});window.estatePolylines=[];}if(window.streetPolylines){window.streetPolylines.forEach(function(p){p.setMap(null);});window.streetPolylines=[];}if(window.blockRect){window.blockRect.setMap(null);window.blockRect=null;}if(mode==="radius"){var rM=parseInt(document.getElementById("radiusSlider").value)||500;radiusCircle=new google.maps.Circle({map:googleMap,center:userMarker.getPosition(),radius:rM,fillColor:ac,fillOpacity:0.1,strokeColor:ac,strokeOpacity:0.8,strokeWeight:2});incidentMarkers.forEach(function(m){var dist=google.maps.geometry.spherical.computeDistanceBetween(userMarker.getPosition(),m.getPosition());m.setOpacity(dist<=rM?1:0.2);});}else if(mode==="estate"){var isUnitComplex=userAddress&&/^\d+\/\d+/.test(userAddress.split(',')[0].trim());if(isUnitComplex){updateGoogleMapMode('street');return;}if(ek==='default'){window.blockRect=drawBlockSquare();applyIncidentScope();return;}window.estatePolylines=[];var suburb=estate.suburb||userSuburb||'Morayfield';var overpassData=streetDataCache[suburb]||{};if(!Object.keys(overpassData).length&&userMarker){getStreetData(userMarker.getPosition().lat(),userMarker.getPosition().lng(),suburb,function(){updateGoogleMapMode('estate');});return;}var estateNames=Object.keys(SUMMERSTONE_STREETS).concat(['Shine Street','Palm Street','Cove Street','Creek Parade','Freshwater Street','Sunrise Street','Dune Street','Sunset Street','Breeze Street','Festival Street','Tropic Street','Island Parade','Golden Road','Moreton Parade','Bay Street','Tide Street','Bloom Drive','Fig Street','Summer Street','Summerstone Boulevard']);var streetData={};if(ek==='summerstone'){estateNames.forEach(function(n){var d=overpassData[n]||SUMMERSTONE_STREETS[n];if(d&&d.length)streetData[n]=d;});if(!Object.keys(streetData).length)streetData=SUMMERSTONE_STREETS;}else if(ek==='montrose'){Object.keys(MONTROSE_STREETS).forEach(function(n){var d=overpassData[n]||MONTROSE_STREETS[n];if(d&&d.length)streetData[n]=d;});if(!Object.keys(streetData).length)streetData=MONTROSE_STREETS;}else{streetData=overpassData;}var mapBounds=new google.maps.LatLngBounds();Object.keys(streetData).forEach(function(sn){var segs=streetData[sn];if(segs&&segs.length){(Array.isArray(segs[0])?segs:[segs]).forEach(function(path){var pl=new google.maps.Polyline({path:path,map:googleMap,strokeColor:ac,strokeOpacity:0.9,strokeWeight:5,geodesic:false});window.estatePolylines.push(pl);path.forEach(function(p){mapBounds.extend(p);});});}});if(window.estatePolylines.length>0)googleMap.fitBounds(mapBounds);incidentMarkers.forEach(function(m){m.setOpacity(1);});}else if(mode==="street"){window.streetPolylines=[];var rawStreet=userAddress?userAddress.split(',')[0].trim().replace(/^\d+\/\d+\s+/,'').replace(/^\d+\/\d+\s+/,'').replace(/^\d+[a-zA-Z]?\s+/,''):'';if(rawStreet){var abbr={'St':'Street','Ave':'Avenue','Av':'Avenue','Rd':'Road','Blvd':'Boulevard','Dr':'Drive','Ct':'Court','Crt':'Court','Pl':'Place','Cr':'Crescent','Cres':'Crescent','Pde':'Parade','Hwy':'Highway','Ln':'Lane','Tce':'Terrace','Cl':'Close'};var rawFull=rawStreet.replace(/\b(St|Ave|Av|Rd|Blvd|Dr|Ct|Crt|Pl|Cr|Cres|Pde|Hwy|Ln|Tce|Cl)$/,function(m){return abbr[m]||m;});var suburb=estate.suburb||userSuburb||'Morayfield';var op=streetDataCache[suburb]||{};var streetPath=op[rawStreet]||op[rawFull]||SUMMERSTONE_STREETS[rawStreet]||SUMMERSTONE_STREETS[rawFull]||null;var myStrLC=rawFull.toLowerCase().split(' ')[0];function drawStreet(data){var segs=data&&data.length?(Array.isArray(data[0])?data:[data]):[];if(!segs.length)return;if(window.streetPolylines){window.streetPolylines.forEach(function(p){p.setMap(null);});window.streetPolylines=[];}var b=new google.maps.LatLngBounds();segs.forEach(function(path){var pl=new google.maps.Polyline({path:path,map:googleMap,strokeColor:ac,strokeOpacity:1,strokeWeight:8,geodesic:false});window.streetPolylines.push(pl);path.forEach(function(p){b.extend(p);});});var _cLat=(b.getSouthWest().lat()+b.getNorthEast().lat())/2;var _cLng=(b.getSouthWest().lng()+b.getNorthEast().lng())/2;setTimeout(function(){googleMap.setCenter({lat:_cLat,lng:_cLng});googleMap.setZoom(16);},800);}getStreetData(userMarker.getPosition().lat(),userMarker.getPosition().lng(),suburb,function(streets){drawStreet(SUMMERSTONE_STREETS[rawFull]||SUMMERSTONE_STREETS[rawStreet]||MONTROSE_STREETS[rawFull]||MONTROSE_STREETS[rawStreet]||streets[rawFull]||streets[rawStreet]||null);});incidentMarkers.forEach(function(m,i){var inc=INCIDENT_LOCATIONS[i];var addr=inc&&INCS[inc.id]?INCS[inc.id].addr.toLowerCase():'';m.setOpacity(!myStrLC||addr.indexOf(myStrLC)!==-1?1:0.15);});[1,2,3,4,5,6].forEach(function(id){var el=document.getElementById('incBtn'+id);if(el){var addr=INCS[id]?INCS[id].addr.toLowerCase():'';el.className='inc-list-btn'+(addr.indexOf(myStrLC)!==-1?'':' dimmed');}});}}applyIncidentScope();}
// Fade out-of-scope pins and refresh the (scope-filtered) list. Runs after any mode draws.
function applyIncidentScope(){
  try{
    incidentMarkers.forEach(function(m,i){
      var loc=INCIDENT_LOCATIONS[i];
      var inc=loc?INCS[loc.id]:null;
      m.setOpacity(incidentInScope(inc)?1:0.2);
    });
    renderIncidentList();
  }catch(e){console.log("scope filter error:",e);}
}
var currentMapMode='street'; function setMapMode(mode,btn){
  currentMapMode=mode;
  document.querySelectorAll('.map-mode-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  var streetInfo=document.getElementById('modeStreetInfo');
  var estateInfo=document.getElementById('modeEstateInfo');
  var radiusControls=document.getElementById('modeRadiusControls');
  var radiusInfo=document.getElementById('radiusInfo');
  if(streetInfo)streetInfo.style.display='none';
  if(estateInfo)estateInfo.style.display='none';
  if(radiusControls)radiusControls.style.display='none';
  if(mode==='street'){if(streetInfo)streetInfo.style.display='block';if(radiusInfo)radiusInfo.textContent='Notifications from '+(userAddress?userAddress.split(',')[0].replace(/^\d+\s+/,''):'your street')+' only';}
  else if(mode==='estate'){var isUnitAddr=userAddress&&/^\d+\/\d+/.test(userAddress.split(',')[0].trim());if(estateInfo){estateInfo.style.display='block';estateInfo.textContent=isUnitAddr?'Showing residents and incidents in your unit complex.':(getEstateFromAddress(userAddress)==='default'?'Showing incidents within your local block (450m around you).':'Showing all incidents within your estate boundary. Your estate is highlighted on the map.');}var ek2=getEstateFromAddress(userAddress);var estate2=ESTATES[ek2]||ESTATES.default;var isUnitMode=userAddress&&/^\d+\/\d+/.test(userAddress.split(',')[0].trim());if(radiusInfo)radiusInfo.innerHTML='&#127960; Notifications from '+(isUnitMode?'your complex':estate2.name||'your estate')+' only';[1,2,3,4,5,6].forEach(function(id){var el=document.getElementById("incBtn"+id);if(el)el.className="inc-list-btn";});}
  else if(mode==='radius'){if(radiusControls)radiusControls.style.display='block';updateRadius(document.getElementById('radiusSlider').value);}
  updateGoogleMapMode(mode);
}
function updateRadius(v){
  var rM=parseInt(v);
  var d=rM>=5000?"Suburb wide":rM>=1000?(rM/1000).toFixed(1)+"km":rM+"m";
  var rv=document.getElementById("radiusVal");if(rv)rv.textContent=d;
  if(currentMapMode==="radius")updateGoogleMapMode("radius");
  var inRange=0;
  // Count real incidents within range (by marker distance) for the info text.
  if(currentMapMode==="radius"&&userMarker&&window.google&&google.maps.geometry){
    incidentMarkers.forEach(function(m){var dist=google.maps.geometry.spherical.computeDistanceBetween(userMarker.getPosition(),m.getPosition());if(dist<=rM)inRange++;});
  }
  var total=incidentMarkers.length;
  var ri=document.getElementById("radiusInfo");if(ri)ri.innerHTML="&#128225; "+inRange+" of "+total+" incident"+(total===1?"":"s")+" within "+d+(total>inRange?" &middot; "+(total-inRange)+" filtered":"");
}
function setRadius(v){document.getElementById("radiusSlider").value=v;updateRadius(v);}
function toggleRadius(){var t=document.getElementById("radiusToggle");var on=t.textContent==="ON";t.textContent=on?"OFF":"ON";t.className=on?"radius-toggle off":"radius-toggle";}

// === LOAD REAL INCIDENTS FROM THE DATABASE ===
async function loadIncidents(){
  try{
    var res=await fetch("/api/incidents");
    if(!res.ok)return;
    var data=await res.json();
    var list=data.incidents||[];
    // Reset stores
    INCS={};
    INCIDENT_LOCATIONS=[];
    // Clear existing map markers
    incidentMarkers.forEach(function(m){m.setMap(null);});
    incidentMarkers=[];
    list.forEach(function(row){
      var style=incidentStyleFor(row.type);
      INCS[row.id]={
        id:row.id,
        emoji:incidentEmojiFor(row.type),
        title:incidentLabelFor(row.type),
        addr:row.address||"Reported nearby",
        time:relativeTime(row.created_at),
        sev:style.sev, sc:style.sc, color:style.color,
        desc:row.description||"",
        resolved_count:row.resolved_count||0,
        phone:row.phone||"",
        lat:row.lat, lng:row.lng
      };
      // Map pin (only if we have coordinates)
      if(googleMap&&row.lat!=null&&row.lng!=null){
        var m=new google.maps.Marker({
          position:{lat:row.lat,lng:row.lng},map:googleMap,title:incidentLabelFor(row.type),
          icon:{path:google.maps.SymbolPath.CIRCLE,scale:10,fillColor:style.color,fillOpacity:0.9,strokeColor:"#fff",strokeWeight:1.5}
        });
        (function(incId){m.addListener("click",function(){selectInc(incId);});})(row.id);
        incidentMarkers.push(m);
        INCIDENT_LOCATIONS.push({id:row.id,lat:row.lat,lng:row.lng,title:incidentLabelFor(row.type),color:style.color});
      }
    });
    INCIDENTS_LOADED=true;
    renderIncidentList();
  }catch(e){console.log("incident load error:",e);}
}
// === RENDER THE INCIDENT LIST (replaces the 6 hardcoded buttons) ===
// === SCOPE FILTERING ===
// Decide whether an incident falls within the user's currently-active scope.
// Used to fade out-of-scope pins and hide out-of-scope list items.
function incidentInScope(inc){
  if(!inc)return true;
  var mode=currentMapMode||"street";
  // Street: match the incident's street name to the user's street.
  if(mode==="street"){
    if(!userAddress)return true;
    var myStreet=userAddress.split(",")[0].trim().replace(/^\d+\/\d+\s+/,"").replace(/^\d+[a-zA-Z]?\s+/,"").toLowerCase();
    if(!myStreet)return true;
    var incStreet=(inc.addr||"").split(",")[0].trim().replace(/^\d+\/\d+\s+/,"").replace(/^\d+[a-zA-Z]?\s+/,"").toLowerCase();
    if(!incStreet)return false;
    return incStreet.indexOf(myStreet)!==-1||myStreet.indexOf(incStreet)!==-1;
  }
  // Radius: within the slider distance (needs coords).
  if(mode==="radius"){
    if(inc.lat==null||inc.lng==null||!userMarker||!window.google||!google.maps.geometry)return true;
    var rM=parseInt(document.getElementById("radiusSlider").value)||500;
    var dist=google.maps.geometry.spherical.computeDistanceBetween(userMarker.getPosition(),new google.maps.LatLng(inc.lat,inc.lng));
    return dist<=rM;
  }
  // "estate" mode covers three real cases: unit complex, mapped estate, or default block.
  if(mode==="estate"){
    var ek=getEstateFromAddress(userAddress);
    var isUnit=userAddress&&/^\d+\/\d+/.test(userAddress.split(",")[0].trim());
    if(isUnit){
      if(inc.lat!=null&&inc.lng!=null&&userMarker&&window.google&&google.maps.geometry){
        var du=google.maps.geometry.spherical.computeDistanceBetween(userMarker.getPosition(),new google.maps.LatLng(inc.lat,inc.lng));
        return du<=250;
      }
      return true;
    }
    if(ek!=="default"){
      return getEstateFromAddress(inc.addr||"")===ek;
    }
    if(inc.lat==null||inc.lng==null||!userMarker||!window.google||!google.maps.geometry)return true;
    var db=google.maps.geometry.spherical.computeDistanceBetween(userMarker.getPosition(),new google.maps.LatLng(inc.lat,inc.lng));
    return db<=320;
  }
  return true;
}
function renderIncidentList(){
  var container=document.getElementById("incList");
  if(!container)return;
  var allIds=Object.keys(INCS);
  var ids=allIds.filter(function(id){return incidentInScope(INCS[id]);});
  if(!allIds.length){
    container.innerHTML="<div class='empty-state' style='padding:24px 12px;'>&#9989;<br/>No incidents reported recently.<br/><span style='font-size:11px;'>Your area is all clear. Tap <strong>+ Report</strong> if you see something.</span></div>";
    return;
  }
  if(!ids.length){
    container.innerHTML="<div class='empty-state' style='padding:24px 12px;'>&#9989;<br/>No incidents in this view.<br/><span style='font-size:11px;'>Nothing reported in your current scope. Try a wider scope to see more.</span></div>";
    return;
  }
  container.innerHTML=ids.map(function(id){
    var inc=INCS[id];
    return "<button class='inc-list-btn' id='incBtn"+id+"' onclick='selectInc(\""+id+"\")'><span class='inc-list-em'>"+inc.emoji+"</span><div style='flex:1;text-align:left;'><div class='inc-list-name'>"+inc.title+"</div><div class='inc-list-sub'>"+inc.addr+" &middot; "+inc.time+" &middot; <span style='color:#fb8c00;'>"+inc.resolved_count+"/3 cleared</span></div></div><div class='sev-dot' style='background:"+inc.sc+";'></div></button>";
  }).join("");
}
function selectInc(id){
  var sel=window.selI===id?null:id;window.selI=sel;
  document.querySelectorAll("[id^=incBtn]").forEach(function(b){b.classList.remove("selected");});
  var detail=document.getElementById("incDetail");
  if(!sel){if(detail)detail.style.display="none";return;}
  var btn=document.getElementById("incBtn"+id);if(btn)btn.classList.add("selected");
  var inc=INCS[id];if(!inc){if(detail)detail.style.display="none";return;}
  var isMine=inc.phone&&userPhone&&(""+inc.phone).replace(/\D/g,"")===(""+userPhone).replace(/\D/g,"");
  var clearPct=Math.min(100,((inc.resolved_count||0)/3)*100);
  detail.style.borderLeftColor=inc.color;detail.style.display="block";
  detail.innerHTML="<div class='inc-detail-top'><span class='inc-emoji-lg'>"+inc.emoji+"</span><div style='flex:1'><div style='display:flex;align-items:center;margin-bottom:3px'><div class='inc-title'>"+inc.title+"</div><span class='sev-badge' style='background:"+inc.sc+"'>"+inc.sev.toUpperCase()+"</span></div><div class='inc-addr-text'>&#128205; "+inc.addr+" &middot; "+inc.time+"</div></div><button class='close-btn' onclick='selectInc(\""+id+"\")'>&#10005;</button></div><p class='inc-desc-text'>"+inc.desc+"</p><div style='display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:10px;color:#888;'><div class='trust-bar'><div class='trust-fill' style='width:"+clearPct+"%'></div></div>"+(inc.resolved_count||0)+"/3 marked cleared</div><div class='inc-verify'><button class='verify-btn vb-confirm' onclick='verifyInc(\""+id+"\",\"confirm\")'>&#10003; Confirm</button><button class='verify-btn vb-resolved' onclick='verifyInc(\""+id+"\",\"resolve\")'>&#9989; Resolved</button><button class='verify-btn vb-notthere' onclick='verifyInc(\""+id+"\",\"notthere\")'>&#10007; Not there</button></div><button class='view-discussion-btn' onclick='openDiscussion(\""+id+"\")'>&#128172; View discussion</button>"+(isMine?"<button onclick='deleteIncident(\""+id+"\")' style='margin-top:10px;width:100%;background:#fff;border:1.5px solid #e53935;color:#e53935;border-radius:10px;padding:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;'>&#128465; Delete my report</button>":"")+"";
  try{setTimeout(function(){detail.scrollIntoView({behavior:"smooth",block:"center"});},100);}catch(e){}
}
async function deleteIncident(id){
  if(!confirm("Delete your report? This cannot be undone."))return;
  try{
    await fetch("/api/incidents",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:id,phone:userPhone})});
    window.selI=null;
    var detail=document.getElementById("incDetail");if(detail)detail.style.display="none";
    showPush({icon:"&#128465;",title:"Report deleted",body:"Your incident report has been removed.",color:"#555"});
    loadIncidents();
  }catch(e){alert("Could not delete. Try again.");}
}
async function verifyInc(id,action){
  if(action==="confirm"){
    showPush({icon:"&#10003;",title:"Thanks for verifying!",body:"Your confirmation helps neighbours stay safe.",color:"#2e7d32"});
    return;
  }
  // 'resolve' or 'notthere' both count toward clearing (3 = auto-resolve)
  try{
    var res=await fetch("/api/incidents",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:id,action:action})});
    var data=await res.json();
    if(data&&data.status==="resolved"){
      showPush({icon:"&#9989;",title:"Incident cleared",body:"Enough neighbours confirmed — it's been resolved.",color:"#1565c0"});
      window.selI=null;
      var detail=document.getElementById("incDetail");if(detail)detail.style.display="none";
    }else{
      showPush({icon:"&#9989;",title:"Marked cleared",body:(data&&data.count?data.count:"")+"/3 confirmations to auto-clear.",color:"#f57f17"});
    }
    loadIncidents();
  }catch(e){showPush({icon:"&#9888;",title:"Couldn't update",body:"Please try again.",color:"#c62828"});}
}
// === INCIDENT DISCUSSION (comments) ===
var currentDiscussionId=null;
function openDiscussion(id){
  var inc=INCS[id];if(!inc)return;
  currentDiscussionId=id;
  // Banner: the original report, pinned at top.
  var banner=document.getElementById("discussionBanner");
  if(banner){
    banner.innerHTML="<div class='discussion-banner-tag'>&#9888; ORIGINAL REPORT &middot; "+inc.sev.toUpperCase()+"</div><div class='discussion-banner-title'>"+inc.emoji+" "+inc.title+"</div><div class='discussion-banner-desc'>"+inc.desc+"</div><div class='discussion-banner-meta'>&#128205; "+inc.addr+" &middot; "+inc.time+"</div>";
  }
  var em=document.getElementById("discussionEmoji");if(em)em.innerHTML=inc.emoji;
  document.getElementById("discussionOverlay").style.display="flex";
  loadComments(id);
}
function closeDiscussion(){
  document.getElementById("discussionOverlay").style.display="none";
  currentDiscussionId=null;
}
async function loadComments(id){
  var box=document.getElementById("discussionComments");
  var sub=document.getElementById("discussionSub");
  if(box)box.innerHTML="<div class='discussion-empty'>Loading...</div>";
  try{
    var res=await fetch("/api/comments?incident_id="+encodeURIComponent(id));
    var data=await res.json();
    var comments=data.comments||[];
    if(sub)sub.textContent=comments.length+" "+(comments.length===1?"reply":"replies");
    renderComments(comments);
  }catch(e){if(box)box.innerHTML="<div class='discussion-empty'>Couldn't load discussion.</div>";}
}
function renderComments(comments){
  var box=document.getElementById("discussionComments");if(!box)return;
  if(!comments.length){
    box.innerHTML="<div class='discussion-empty'>&#128172;<br/>No replies yet.<br/>Be the first to add to this discussion.</div>";
    return;
  }
  box.innerHTML=comments.map(function(c){
    var mine=c.phone&&userPhone&&(""+c.phone).replace(/\D/g,"")===(""+userPhone).replace(/\D/g,"");
    var name=c.display_name||"Neighbour";
    var when=relativeTime(c.created_at);
    var initial=name.charAt(0).toUpperCase();
    if(mine){
      return "<div class='dc-row me'><div class='dc-bubble-wrap'><div class='dc-meta'>You &middot; "+when+"</div><div class='dc-bubble me'>"+c.content+"</div><button class='dc-del' onclick='deleteComment(\""+c.id+"\")'>&#128465; delete</button></div></div>";
    }
    return "<div class='dc-row'><div class='dc-av'>"+initial+"</div><div class='dc-bubble-wrap'><div class='dc-meta'>"+name+" &middot; "+when+"</div><div class='dc-bubble them'>"+c.content+"</div></div></div>";
  }).join("");
  box.scrollTop=box.scrollHeight;
}
async function postComment(){
  var input=document.getElementById("discussionInput");
  var text=input.value.trim();
  if(!text)return;
  if(!isLoggedIn){alert("Please sign up to join the discussion.");window.location.href="/signup.html";return;}
  if(!currentDiscussionId)return;
  input.value="";
  try{
    await fetch("/api/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({incident_id:currentDiscussionId,phone:userPhone,display_name:userDisplay,content:text})});
    loadComments(currentDiscussionId);
  }catch(e){showPush({icon:"&#9888;",title:"Couldn't post",body:"Please try again.",color:"#c62828"});input.value=text;}
}
async function deleteComment(commentId){
  if(!confirm("Delete your comment?"))return;
  try{
    await fetch("/api/comments",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:commentId,phone:userPhone})});
    loadComments(currentDiscussionId);
  }catch(e){alert("Could not delete. Try again.");}
}
function openReport(){document.getElementById("reportModal").style.display="flex";setTimeout(function(){initReportMap();},200);} function initReportMap(){if(!window.google||!window.google.maps)return;var center=userMarker?userMarker.getPosition():{lat:-27.1307,lng:152.9518};if(!reportMap){reportMap=new google.maps.Map(document.getElementById("reportMapDiv"),{center:center,zoom:16,mapTypeId:"roadmap",disableDefaultUI:true,zoomControl:true,gestureHandling:"cooperative"});reportMarker=new google.maps.Marker({position:center,map:reportMap,draggable:true,icon:{path:google.maps.SymbolPath.CIRCLE,scale:10,fillColor:"#e53935",fillOpacity:1,strokeColor:"#fff",strokeWeight:2},title:"Drag to incident location"});reportMarker.addListener("dragend",function(){reportLatLng={lat:reportMarker.getPosition().lat(),lng:reportMarker.getPosition().lng()};reverseGeocodeReport(reportLatLng);});reportMap.addListener("click",function(e){var pos=e.latLng;if(userMarker){var dist=google.maps.geometry.spherical.computeDistanceBetween(userMarker.getPosition(),pos);if(dist>2000){document.getElementById("reportLocationLabel").textContent="Too far — please report near your area";return;}}reportMarker.setPosition(pos);reportLatLng={lat:pos.lat(),lng:pos.lng()};reverseGeocodeReport(reportLatLng);});}else{reportMap.setCenter(center);reportMarker.setPosition(center);google.maps.event.trigger(reportMap,"resize");}reportLatLng={lat:center.lat(),lng:center.lng()};reverseGeocodeReport(reportLatLng);} function reverseGeocodeReport(latlng){var label=document.getElementById("reportLocationLabel");if(!label||!window.google)return;label.textContent="&#128205; Locating...";var geocoder=new google.maps.Geocoder();geocoder.geocode({location:latlng},function(results,status){if(status==="OK"&&results[0]){var name=results[0].formatted_address.replace(", QLD, Australia","").replace(", Australia","");label.textContent="&#128205; "+name;}else{label.textContent="&#128205; Location selected";}});}
function closeReport(){document.getElementById("reportModal").style.display="none";document.getElementById("reportForm").style.display="block";document.getElementById("reportSuccess").style.display="none";document.getElementById("reportDesc").value="";document.querySelectorAll(".type-btn").forEach(function(b,i){b.className=i===0?"type-btn active":"type-btn";});reportMap=null;reportMarker=null;reportLatLng=null;document.getElementById("reportMapDiv").innerHTML="";}
function setType(b){document.querySelectorAll(".type-btn").forEach(function(x){x.className="type-btn";});b.className="type-btn active";}
async function submitReport(){var desc=document.getElementById("reportDesc").value.trim();if(!desc)return;var activeType=document.querySelector(".type-btn.active");var type=activeType?activeType.textContent.trim():"General";try{var res=await fetch("/api/incidents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:userPhone,address:userAddress,type:type,description:desc,lat:reportLatLng?reportLatLng.lat:null,lng:reportLatLng?reportLatLng.lng:null,location_label:document.getElementById("reportLocationLabel")?document.getElementById("reportLocationLabel").textContent.replace("&#128205; ",""):null})});if(res.ok){document.getElementById("reportForm").style.display="none";document.getElementById("reportSuccess").style.display="block";setTimeout(function(){closeReport();showPush({icon:"&#128680;",title:"Incident Reported",body:"Submitted. Neighbours being notified.",color:"#e65100"});loadIncidents();},2000);}}catch(e){}}
var pT;
function showPush(n){var b=document.getElementById("pushBanner");document.getElementById("pushIcon").innerHTML=n.icon;document.getElementById("pushTitle").textContent=n.title;document.getElementById("pushBodyText").textContent=n.body;b.style.background=n.color||"#2d4a2d";b.style.display="flex";clearTimeout(pT);pT=setTimeout(dismissPush,5000);}
function dismissPush(){document.getElementById("pushBanner").style.display="none";}
function markNotifRead(card){card.classList.add("read");var dot=card.querySelector(".unread-dot");if(dot)dot.style.display="none";updateNotifBadge();}
function markNotifsRead(){document.querySelectorAll(".notif-card").forEach(function(c){markNotifRead(c);});}
function updateNotifBadge(){var unread=document.querySelectorAll(".notif-card:not(.read)").length;var b=document.getElementById("notifBadge");var tb=document.getElementById("tabNotifBadge");if(unread>0){if(b){b.textContent=unread;b.style.display="flex";}if(tb){tb.textContent=unread;tb.style.display="flex";}}else{if(b)b.style.display="none";if(tb)tb.style.display="none";}}
var LOCAL_LISTINGS=[{emoji:"&#127818;",title:"Fruit Kart",location:"Summerstone Estate",desc:"Mangoes $1, bananas 50c. Cash only. 7am til sold out.",tags:["Fresh produce","Cash"],badge:"OPEN NOW",badgeColor:"#2e7d32",estate:"summerstone"},{emoji:"&#128210;",title:"Bookkeeper",location:"Summerstone Estate",desc:"BAS, payroll, Xero. Tradies welcome. First consult free.",tags:["Paid","Tax"],badge:"NEIGHBOUR RATE",badgeColor:"#bf360c",estate:"summerstone"},{emoji:"&#127939;",title:"Run Club",location:"Summerstone Estate",desc:"Saturday 5km. All paces welcome. Just show up!",tags:["Free","Sat 6am"],badge:"SAT 6AM",badgeColor:"#6a1b9a",estate:"summerstone"},{emoji:"&#129370;",title:"Fresh Eggs $5/dozen",location:"Summerstone Estate",desc:"Free range, collected daily. Cash in letterbox.",tags:["$5/dozen","Cash"],badge:"AVAILABLE",badgeColor:"#e65100",estate:"summerstone"},{emoji:"&#128170;",title:"Boot Camp",location:"Summerstone Estate",desc:"Free workout Tue & Thu 5:30pm. All levels.",tags:["Free","Tue & Thu"],badge:"TUE & THU",badgeColor:"#00695c",estate:"summerstone"}];
function renderLocalTab(){var container=document.getElementById("localListings");if(!container)return;var ek=getEstateFromAddress(userAddress);var filtered=LOCAL_LISTINGS.filter(function(l){return!userAddress||l.estate===ek;});var estate=ESTATES[ek]||ESTATES.default;var lt=document.getElementById("localTitle");if(lt)lt.innerHTML="&#127960; LOCAL &mdash; "+(estate.name||"YOUR AREA").toUpperCase();if(filtered.length===0){container.innerHTML="<div class='empty-state'>&#127960;<br/>No local listings for your area yet.<br/><strong>Be the first to add one!</strong></div>";return;}container.innerHTML=filtered.map(function(item){return"<div class='local-card'><div class='local-top'><span class='local-emoji'>"+item.emoji+"</span><div style='flex:1;'><div class='local-title'>"+item.title+"</div><div class='local-addr'>&#128205; "+item.location+"</div></div><span class='local-badge' style='background:"+item.badgeColor+";'>"+item.badge+"</span></div><p class='local-desc'>"+item.desc+"</p><div class='tags'>"+item.tags.map(function(t){return"<span class='tag'>"+t+"</span>";}).join("")+"</div></div>";}).join("");}
function addListing(){if(!isLoggedIn){alert("Please sign up first.");window.location.href="/signup.html";return;}var title=prompt("What are you offering?");if(!title||!title.trim())return;var desc=prompt("Describe it:");if(!desc||!desc.trim())return;var price=prompt("Price? (e.g. Free, $5)");var ek=getEstateFromAddress(userAddress);LOCAL_LISTINGS.push({emoji:"&#127960;",title:title.trim(),location:(ESTATES[ek]||ESTATES.default).name||userSuburb||"Local",desc:desc.trim(),tags:[price||"Free"],badge:"NEW",badgeColor:"#313131",estate:ek});renderLocalTab();showPush({icon:"&#127960;",title:"Listing Added!",body:title.trim()+" added.",color:"#313131"});}
function toggleInterest(btn,interest){btn.classList.toggle("selected");var interests=[];document.querySelectorAll(".interest-tag.selected").forEach(function(b){interests.push(b.textContent.trim());});localStorage.setItem("sc_interests",JSON.stringify(interests));}
function editDisplayName(){var newName=prompt("Enter your display name:",userDisplay);if(newName&&newName.trim()){userDisplay=newName.trim();localStorage.setItem("sc_display",userDisplay);var mt=document.getElementById("myAddrText");if(mt)mt.textContent=userDisplay;var pn=document.getElementById("profileName");if(pn)pn.textContent=userDisplay;showPush({icon:"&#128100;",title:"Display name updated",body:"You now appear as "+userDisplay,color:"#313131"});}}
function saveProfile(){var newName=document.getElementById('editDisplayName').value.trim();var newBio=document.getElementById('editBio').value.trim();var interests=[];document.querySelectorAll('.interest-tag.selected').forEach(function(t){interests.push(t.textContent.trim());});if(newName){userDisplay=newName;localStorage.setItem('sc_display',newName);}if(newBio)localStorage.setItem('sc_bio',newBio);if(interests.length)localStorage.setItem('sc_interests',JSON.stringify(interests));var mt=document.getElementById('myAddrText');if(mt)mt.textContent=userDisplay;showPush({icon:'&#10003;',title:'Profile updated!',body:'Your changes have been saved.',color:'var(--ec)'});closeProfile();}
function openProfile(){var ek=getEstateFromAddress(userAddress);var estate=ESTATES[ek]||ESTATES.default;var council=getCouncilFromSuburb(userSuburb);var av=document.getElementById("profileAvatar");if(av){var txt=document.getElementById("profileAvatarText");if(txt)txt.textContent=userDisplay.charAt(0).toUpperCase()||"T";}var pn=document.getElementById("profileName");if(pn)pn.textContent=userDisplay;var pa=document.getElementById("profileAddress");if(pa)pa.textContent=userAddress||"Not set";var pe=document.getElementById("profileEstate");if(pe)pe.textContent=(estate.name||"Unknown")+" \u00b7 "+(userSuburb||"");var pc=document.getElementById("profileCouncil");if(pc)pc.textContent=council;var interests=JSON.parse(localStorage.getItem("sc_interests")||"[]");document.querySelectorAll(".interest-tag").forEach(function(b){b.classList.toggle("selected",interests.indexOf(b.textContent.trim())!==-1);});updatePhotoDisplay();document.getElementById("profileModal").style.display="flex";}
function closeProfile(){document.getElementById("profileModal").style.display="none";}
function logout(){if(!confirm("Logout?"))return;["sc_address","sc_phone","sc_suburb","sc_display","sc_welcomed","sc_interests","sc_photo"].forEach(function(k){localStorage.removeItem(k);});closeProfile();location.reload();}
function openSettings(){document.getElementById("settingsModal").style.display="flex";}
function closeSettings(){document.getElementById("settingsModal").style.display="none";}
function toggleSetting(el){el.classList.toggle("on");}

// DM SYSTEM (tab-based)
var currentDM=null;
var dmMessages={};
function openDM(neighbourName,neighbourPhone){
  if(!isLoggedIn){alert("Please sign up to send messages.");return;}
  if(!neighbourPhone||neighbourPhone==="demo"||neighbourPhone===userPhone)return;
  currentDM={name:neighbourName,phone:neighbourPhone};
  if(!dmMessages[neighbourPhone])dmMessages[neighbourPhone]=[];
  var list=document.getElementById("dmList");
  if(list){var existing=document.getElementById("dm_"+neighbourPhone);if(!existing){var item=document.createElement("div");item.className="dm-item";item.id="dm_"+neighbourPhone;item.onclick=function(){openDMConvo(neighbourName,neighbourPhone);};item.innerHTML="<div class='dm-avatar'>"+neighbourName.charAt(0).toUpperCase()+"</div><div style='flex:1'><div class='dm-name'>"+neighbourName+"</div><div class='dm-preview'>Tap to open conversation</div></div>";list.innerHTML="";list.appendChild(item);}}
  switchTab("dms",null);
  openDMConvo(neighbourName,neighbourPhone);
}
function openDMConvo(name,phone){currentDM={name:name,phone:phone};document.getElementById("dmInbox").style.display="none";var convo=document.getElementById("dmConvo");convo.style.display="flex";convo.style.flexDirection="column";document.getElementById("dmConvoName").textContent=name;renderDMMessages(phone);}
function closeDMConvo(){document.getElementById("dmConvo").style.display="none";document.getElementById("dmInbox").style.display="flex";document.getElementById("dmInbox").style.flexDirection="column";}
function renderDMMessages(phone){var msgs=dmMessages[phone]||[];var container=document.getElementById("dmMessages");if(!msgs.length){container.innerHTML="<div class='empty-state'>&#128172;<br/>Start the conversation!</div>";return;}container.innerHTML=msgs.map(function(m){var isMe=m.from==="me";return"<div class='msg-row"+(isMe?" me":"")+"'>"+(isMe?"":"<div class='msg-av'>&#127968;</div>")+"<div style='max-width:75%'>"+(isMe?"":"<div class='msg-meta'>"+currentDM.name+" &middot; "+m.time+"</div>")+"<div class='bubble "+(isMe?"me":"them")+"'><p>"+m.text+"</p></div></div>"+(isMe?"<div class='msg-av'>&#127968;</div>":"")+"</div>";}).join("");container.scrollTop=container.scrollHeight;}
function sendDM(){var input=document.getElementById("dmInput");var text=input.value.trim();if(!text||!currentDM)return;input.value="";var n=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});if(!dmMessages[currentDM.phone])dmMessages[currentDM.phone]=[];dmMessages[currentDM.phone].push({from:"me",text:text,time:n});renderDMMessages(currentDM.phone);showPush({icon:"&#128172;",title:"Message sent",body:"Your private message was delivered.",color:"var(--ec)"});}

var msgReactions={};
function addReaction(msgId,emoji){if(!msgReactions[msgId])msgReactions[msgId]={};if(msgReactions[msgId][emoji])delete msgReactions[msgId][emoji];else msgReactions[msgId][emoji]=true;loadMessages();}

function applyEstateBranding(){
  var ek=getEstateFromAddress(userAddress);var estate=ESTATES[ek]||ESTATES.default;var council=getCouncilFromSuburb(userSuburb);
  document.documentElement.style.setProperty("--ec",estate.color);document.documentElement.style.setProperty("--ea",estate.accent);
  var header=document.getElementById("mainHeader");if(header)header.style.background=estate.color;
  var logo=document.getElementById("estateLogo");var placeholder=document.getElementById("estatePlaceholder");
  if(logo&&estate.logo){logo.src=estate.logo;logo.style.display="block";logo.style.maxWidth="220px";logo.style.maxHeight="90px";logo.style.objectFit="contain";if(placeholder)placeholder.style.display="none";}
  else if(estate.seriesM){if(logo)logo.style.display="none";if(placeholder){placeholder.style.display="flex";placeholder.style.flexDirection="column";placeholder.style.alignItems="center";var mImg=document.createElement("img");mImg.src="/montrose-m.png";mImg.style.cssText="height:60px;object-fit:contain;margin-bottom:6px;";var nameDiv=document.createElement("div");nameDiv.style.cssText="font-size:20px;font-weight:300;color:#d4dde8;letter-spacing:7px;font-family:Georgia,serif;";nameDiv.textContent="MONTROSE";var subDiv=document.createElement("div");subDiv.style.cssText="font-size:9px;color:rgba(184,197,214,0.5);letter-spacing:4px;margin-top:3px;";subDiv.textContent="MORAYFIELD";placeholder.innerHTML="";placeholder.appendChild(mImg);placeholder.appendChild(nameDiv);placeholder.appendChild(subDiv);}}
  else{if(logo)logo.style.display="none";if(placeholder){placeholder.style.display="flex";placeholder.innerHTML="&#127960;";}}
  var hStreet=document.getElementById("hStreet");var hSuburb=document.getElementById("hSuburb");var hEstate=document.getElementById("hEstate");var hCouncil=document.getElementById("hCouncil");var composeLocation=document.getElementById("composeLocation");
  if(hStreet)hStreet.textContent=userDisplay||"";if(hSuburb)hSuburb.textContent=userSuburb||"";if(hEstate)hEstate.textContent=(estate.name||council).toUpperCase();if(hCouncil)hCouncil.textContent=council.toUpperCase()+" \u00b7 STREET CONNECT";if(composeLocation)composeLocation.textContent=estate.name||council; var estateBtn=document.getElementById('modeEstate'); if(estateBtn){   var isUnit=userAddress&&/^\d+\/\d+/.test(userAddress.split(',')[0].trim());   var hasEstate=ek!=='default';   if(isUnit){estateBtn.style.display='block';estateBtn.innerHTML='&#127960; My Complex';}   else if(hasEstate){estateBtn.style.display='block';estateBtn.innerHTML='&#127960; My Estate';}   else{estateBtn.style.display='block';estateBtn.innerHTML='&#127991; My Block';} }
  var COUNCIL_COLORS={"Moreton Bay City":{"c":"#2a3a00","a":"#b5cc18"},"Ipswich City":{"c":"#1a3020","a":"#69f0ae"},"Logan City":{"c":"#1a5c1a","a":"#81c784"},"Brisbane City":{"c":"#4a1a5c","a":"#ce93d8"}};
  if(ek==="default"&&COUNCIL_COLORS[council]){var cc=COUNCIL_COLORS[council];document.documentElement.style.setProperty("--ec",cc.c);document.documentElement.style.setProperty("--ea",cc.a);if(header)header.style.background=cc.c;if(placeholder){placeholder.style.display="flex";placeholder.style.flexDirection="column";placeholder.style.alignItems="center";var councilIcons={"Moreton Bay City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(181,204,24,0.15)' stroke='rgba(181,204,24,0.4)' stroke-width='1.5'/><path d='M15 42 L15 28 L22 22 L30 18 L38 22 L45 28 L45 42 Z' fill='none' stroke='rgba(79,195,247,0.8)' stroke-width='1.5' stroke-linejoin='round'/><path d='M25 42 L25 34 L35 34 L35 42' fill='none' stroke='rgba(79,195,247,0.8)' stroke-width='1.5'/><path d='M10 42 L50 42' stroke='rgba(79,195,247,0.6)' stroke-width='1.5'/><circle cx='30' cy='26' r='3' fill='rgba(79,195,247,0.6)'/><path d='M20 42 L20 30' stroke='rgba(79,195,247,0.4)' stroke-width='1'/><path d='M40 42 L40 30' stroke='rgba(79,195,247,0.4)' stroke-width='1'/></svg>","Ipswich City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(255,138,101,0.15)' stroke='rgba(255,138,101,0.4)' stroke-width='1.5'/><path d='M18 42 L18 24 L30 16 L42 24 L42 42 Z' fill='none' stroke='rgba(255,138,101,0.8)' stroke-width='1.5' stroke-linejoin='round'/><rect x='26' y='32' width='8' height='10' fill='none' stroke='rgba(255,138,101,0.8)' stroke-width='1.5'/><rect x='20' y='28' width='6' height='6' fill='none' stroke='rgba(255,138,101,0.5)' stroke-width='1'/><rect x='34' y='28' width='6' height='6' fill='none' stroke='rgba(255,138,101,0.5)' stroke-width='1'/><path d='M10 42 L50 42' stroke='rgba(255,138,101,0.6)' stroke-width='1.5'/><path d='M30 16 L30 10 M27 13 L33 13' stroke='rgba(255,138,101,0.5)' stroke-width='1.5' stroke-linecap='round'/></svg>","Logan City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(129,199,132,0.15)' stroke='rgba(129,199,132,0.4)' stroke-width='1.5'/><path d='M30 12 C18 18 12 26 12 34 C12 42 20 48 30 48 C40 48 48 42 48 34 C48 26 42 18 30 12Z' fill='none' stroke='rgba(129,199,132,0.5)' stroke-width='1'/><path d='M30 18 C22 22 18 28 18 34 C18 40 24 44 30 44 C36 44 42 40 42 34 C42 28 38 22 30 18Z' fill='none' stroke='rgba(129,199,132,0.7)' stroke-width='1.5'/><circle cx='30' cy='34' r='5' fill='rgba(129,199,132,0.4)' stroke='rgba(129,199,132,0.8)' stroke-width='1.5'/><path d='M30 18 L30 12 M22 20 L18 16 M38 20 L42 16' stroke='rgba(129,199,132,0.5)' stroke-width='1' stroke-linecap='round'/></svg>","Brisbane City":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(206,147,216,0.15)' stroke='rgba(206,147,216,0.4)' stroke-width='1.5'/><rect x='16' y='30' width='8' height='12' fill='none' stroke='rgba(206,147,216,0.6)' stroke-width='1.5'/><rect x='26' y='22' width='8' height='20' fill='none' stroke='rgba(206,147,216,0.8)' stroke-width='1.5'/><rect x='36' y='26' width='8' height='16' fill='none' stroke='rgba(206,147,216,0.6)' stroke-width='1.5'/><path d='M10 42 L50 42' stroke='rgba(206,147,216,0.6)' stroke-width='1.5'/><path d='M20 30 L20 24 M30 22 L30 14 M40 26 L40 18' stroke='rgba(206,147,216,0.4)' stroke-width='1' stroke-dasharray='2,2'/></svg>","Greater Brisbane":"<svg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='30' cy='30' r='28' fill='rgba(105,240,174,0.1)' stroke='rgba(105,240,174,0.3)' stroke-width='1.5'/><path d='M20 38 C20 32 24 26 30 24 C36 26 40 32 40 38' fill='none' stroke='rgba(105,240,174,0.6)' stroke-width='1.5'/><circle cx='30' cy='24' r='4' fill='none' stroke='rgba(105,240,174,0.8)' stroke-width='1.5'/><path d='M15 38 L45 38' stroke='rgba(105,240,174,0.5)' stroke-width='1.5'/><path d='M22 38 L22 42 M30 38 L30 44 M38 38 L38 42' stroke='rgba(105,240,174,0.4)' stroke-width='1' stroke-linecap='round'/></svg>"};var icon=councilIcons[council]||councilIcons["Greater Brisbane"];placeholder.innerHTML=icon+"<div style='font-size:9px;color:rgba(255,255,255,0.55);letter-spacing:2px;font-weight:700;text-align:center;margin-top:6px;'>"+council.toUpperCase()+"</div>";}}
  var binKey=(userSuburb||"").toLowerCase();var binText=BIN_SCHEDULES[binKey]||estate.binDay||"Check your council website for bin day.";var pt=document.getElementById("pinnedBinTitle");var pb=document.getElementById("pinnedBinBody");if(pt)pt.innerHTML="&#128721; Bin Day &mdash; "+(userSuburb||"Your Area");if(pb)pb.innerHTML=binText;
  var splash=document.getElementById("splashScreen");var splashLogo=document.getElementById("splashLogo");var splashText=document.getElementById("splashText");
  if(splash&&isLoggedIn&&!localStorage.getItem("sc_splashed")){if(estate.logo&&splashLogo){splashLogo.src=estate.logo;splashLogo.style.display="block";}if(splashText)splashText.textContent="Welcome to "+(estate.name||"Street Connect");splash.style.display="flex";localStorage.setItem("sc_splashed","1");setTimeout(function(){splash.style.opacity="0";setTimeout(function(){splash.style.display="none";},500);},2500);}else if(splash){splash.style.display="none";}
}
function updateHeader(){var jw=document.getElementById("joinBtnWrap");var mb=document.getElementById("myAddrBtn");var mt=document.getElementById("myAddrText");if(isLoggedIn&&userAddress){if(jw)jw.style.display="none";if(mb)mb.style.display="block";if(mt)mt.textContent=userDisplay;}else{if(jw)jw.style.display="block";if(mb)mb.style.display="none";}}
async function updateNeighbourCount(){try{var res=await fetch("/api/get-users?password=count_only");if(res.ok){var data=await res.json();var count=data.total||0;var el=document.getElementById("neighbourCount");if(el)el.textContent=count+" neighbour"+(count===1?"":"s")+" active";}}catch(e){var el=document.getElementById("neighbourCount");if(el)el.textContent="community growing";}}
function messageAdmin(){var msg=prompt("Message to Street Connect support:");if(msg&&msg.trim()){fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:userPhone,address:userAddress,suburb:"ADMIN_MSG",content:"[SUPPORT] "+msg.trim(),display_name:userDisplay})}).then(function(){alert("Message sent! We will get back to you soon.");});}}
window.addEventListener("online",function(){var b=document.getElementById("offlineBanner");if(b)b.style.display="none";loadMessages();});
window.addEventListener("offline",function(){var b=document.getElementById("offlineBanner");if(b)b.style.display="block";});

function showWelcomeSplash(){var splash=document.getElementById("welcomeSplash");var wLogo=document.getElementById("welcomeLogo");var wName=document.getElementById("welcomeEstateName");var ek=getEstateFromAddress(userAddress);var estate=ESTATES[ek]||ESTATES.default;if(!splash)return;if(estate.logo&&wLogo){wLogo.src=estate.logo;wLogo.style.display="block";}if(wName)wName.textContent=estate.name||"Street Connect";splash.style.display="flex";setTimeout(function(){splash.style.opacity="0";splash.style.transition="opacity 0.5s";setTimeout(function(){splash.style.display="none";splash.style.opacity="1";},500);},2500);}

updateHeader();
applyEstateBranding();
updatePhotoDisplay();
updateNeighbourCount();
renderLocalTab();
updateRadius(500);
updateNotifBadge();
initGoogleMap();
setTimeout(function(){if(googleMap)google.maps.event.trigger(googleMap,'resize');},500);
if(!navigator.onLine){var b=document.getElementById("offlineBanner");if(b)b.style.display="block";}
if(isLoggedIn&&!localStorage.getItem("sc_welcomed")){showWelcomeSplash();var ek2=getEstateFromAddress(userAddress);var estate2=ESTATES[ek2]||ESTATES.default;setTimeout(function(){showPush({icon:"&#127881;",title:"Welcome to Street Connect!",body:"You are now connected with your neighbours. Say hello!",color:estate2.color});localStorage.setItem("sc_welcomed","1");},3000);}
