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
