// Dynamic header — show address if logged in, join button if not
function updateHeader() {
  var addr = localStorage.getItem('sc_address');
  var display = localStorage.getItem('sc_display');
  var joinBtn = document.getElementById('joinBtn');
  var myAddressBtn = document.getElementById('myAddressBtn');
  if (addr && display) {
    if (joinBtn) joinBtn.style.display = 'none';
    if (myAddressBtn) {
      myAddressBtn.style.display = 'block';
      myAddressBtn.textContent = '&#128205; ' + display;
      myAddressBtn.innerHTML = '&#128205; ' + display;
    }
  } else {
    if (joinBtn) joinBtn.style.display = 'block';
    if (myAddressBtn) myAddressBtn.style.display = 'none';
  }
}

// Get real neighbour count from database
async function updateNeighbourCount() {
  try {
    var res = await fetch('/api/get-users?password=count_only');
    if (res.ok) {
      var data = await res.json();
      var count = data.total || 0;
      var el = document.getElementById('neighbourCount');
      if (el) el.textContent = count + (count === 1 ? ' neighbour' : ' neighbours');
    }
  } catch(e) {
    var el = document.getElementById('neighbourCount');
    if (el) el.textContent = 'neighbours';
  }
}

updateHeader();
updateNeighbourCount();
function switchTab(t,b){document.querySelectorAll('.content').forEach(e=>e.style.display='none');document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));document.getElementById('tab-'+t).style.display='flex';b.classList.add('active');}
function setFilter(t,b){document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('#chatMessages>[data-type]').forEach(e=>{if(t==='all')e.style.display='';else if(t==='official')e.style.display=e.dataset.type==='official'?'':'none';else e.style.display=(e.dataset.type==='neighbour'||e.dataset.type==='me')?'':'none';});}
function toggleLike(b,c){if(b.classList.contains('liked')){b.classList.remove('liked');b.textContent=c>1?'👍 '+(c-1):'👍';}else{b.classList.add('liked');b.textContent='👍 '+(c+1);}}
var userAddress=localStorage.getItem('sc_address')||'Greater Brisbane';
var userPhone=localStorage.getItem('sc_phone')||'';
var userSuburb=localStorage.getItem('sc_suburb')||'';
var userDisplay=localStorage.getItem('sc_display')||'Neighbour';

function sendMsg(){var i=document.getElementById('chatInput');if(!i.value.trim())return;var content=i.value.trim();i.value='';document.getElementById('sendBtn').style.background='#ccc';fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:userPhone,address:userAddress,suburb:userSuburb,content:content,display_name:userDisplay})}).then(function(){loadMessages();}).catch(function(){});var a=document.getElementById('aiNote');a.style.display='block';setTimeout(function(){a.style.display='none';},3000);}

async function loadMessages(){try{var res=await fetch('/api/messages');var data=await res.json();var msgs=data.messages||[];var container=document.getElementById('myMessages');container.innerHTML='';msgs.forEach(function(msg){var isMe=msg.phone===userPhone;var n=new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});var displayName=msg.display_name||msg.address||'Neighbour';var d=document.createElement('div');d.className='msg-row'+(isMe?' me':'');d.dataset.type=isMe?'me':'neighbour';if(isMe){d.innerHTML='<div style="max-width:75%"><div class="bubble me"><p>'+msg.content+'</p></div></div><div class="msg-av">&#127968;</div>';}else{d.innerHTML='<div class="msg-av">&#127968;</div><div style="max-width:75%"><div class="msg-meta">'+displayName+' &middot; '+n+'</div><div class="bubble them"><p>'+msg.content+'</p></div></div>';}container.appendChild(d);});document.getElementById('chatBottom').scrollIntoView({behavior:'smooth'});}catch(e){console.log('msg error:',e);}}

loadMessages();
setInterval(loadMessages,10000);
async function deleteMessage(id){
  if(!confirm('Delete this message?'))return;
  try{
    await fetch('/api/messages',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,phone:userPhone})});
    loadMessages();
  }catch(e){console.log('delete error:',e);}
}
