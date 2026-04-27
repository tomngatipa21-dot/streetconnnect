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
