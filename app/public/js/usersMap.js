/**
 * Bonoldi Enrico
 * 
 * Lazy loading of users map
 */
(() => {
   var usersMap = L.map('usersmap')
   var distanceRange = document.querySelector("#distanceRange")
   var usersList = document.querySelector("#usersList")
   var currentUser = null

   var redIcon = new L.Icon({
      iconUrl: '/images/marker-icon-red.png',
      shadowUrl: 'images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
   });

   var blueIcon = new L.Icon({
      iconUrl: '/images/marker-icon-blue.png',
      shadowUrl: 'images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
   });

   // Map setup   
   L.tileLayer('https://a.tile.openstreetmap.de/{z}/{x}/{y}.png', {
      maxZoom: 14,
      tileSize: 512,
      zoomOffset: -1,
   }).addTo(usersMap)
   var usersLayer = L.layerGroup().addTo(usersMap)

   // Get users data by distance
   const updateUsers = (distance) => {
      usersLayer.clearLayers()
      usersList.innerHTML = ""

      console.log("[[FETCH]] start fetching...")
      fetch(`/api/find/${distance}`).then(res => res.json().then(data => {
         console.log("[[FETCH]] done fetching!")
         let users = data.users

         if (!currentUser) {
            currentUser = users.filter(user => user.distance_between == 0)[0]
         }

         usersMap.setView([currentUser.posizione_coordinate.split(/[\s()]+/)[2], currentUser.posizione_coordinate.split(/[\s()]+/)[1]], 10)

         users.forEach(user => {
            if (currentUser.id !== user.id) {
               // Build the list element
               let userDOMel = document.createElement(`li`)
               userDOMel.classList = "list-group-item d-flex justify-content-between align-items-center"
               userDOMel.onclick = () => usersMap.setView([user.posizione_coordinate.split(/[\s()]+/)[2], user.posizione_coordinate.split(/[\s()]+/)[1]], 12)

               let userLink = document.createElement(`a`)
               userLink.href = `/user/${user.id}`
               userLink.innerHTML = ` ${user.nome} ${user.cognome} `

               let userIMG = document.createElement(`img`)
               userIMG.width = `50`
               userIMG.src = `/users/img/${user.id}`

               userDOMel.append(userLink, userIMG)//,userGOTO)
               usersList.appendChild(userDOMel)
               L.marker([user.posizione_coordinate.split(/[\s()]+/)[2], user.posizione_coordinate.split(/[\s()]+/)[1]], { icon: blueIcon }).bindPopup(`<img src="/users/img/${user.id}" width="50" ><a  href="/user/${user.id}">${user.nome} ${user.cognome} ( ${Math.round(user.distance_between) / 1000} km)</a>`).addTo(usersLayer)
            } else {
               L.marker([user.posizione_coordinate.split(/[\s()]+/)[2], user.posizione_coordinate.split(/[\s()]+/)[1]], { icon: redIcon }).addTo(usersLayer)
            }
         })

         if (users.length <= 1) {
            let userDOMel = document.createElement(`li`)
            userDOMel.classList = "list-group-item d-flex justify-content-between align-items-center"
            userDOMel.innerHTML = "<b>Nessun utente trovato...</b>"

            usersList.appendChild(userDOMel)
         }

         L.circle([currentUser.posizione_coordinate.split(/[\s()]+/)[2], currentUser.posizione_coordinate.split(/[\s()]+/)[1]], {
            color: 'green',
            fillColor: '#90EE90',
            fillOpacity: 0.3,
            radius: data.distance
         }).addTo(usersLayer)
      })).catch(err => console.log("[[FETCH]] error while fetching!", err))
   }

   distanceRange.oninput = ev => document.getElementById("distance").innerHTML = ev.target.value
   distanceRange.onchange = ev => updateUsers(ev.target.value * 1000)

   updateUsers(10 * 1000)
   document.getElementById("distance").innerHTML = 10
   distanceRange.value = 10
})()