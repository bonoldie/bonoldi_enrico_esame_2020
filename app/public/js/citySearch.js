/**
 * Bonoldi Enrico
 * 
 * Search & select of cities
 */
(() => {
   var cities = []

   $('#cittaRicerca').on('input', (e) => {
      let filteredCities = cities.filter(city => city.comune.includes(e.target.value) || city.provincia.includes(e.target.value) || city.regione.includes(e.target.value))

      $('#cittaSelect').empty()
      $('#cittaSelect').append(filteredCities.map(filteredCity => {
         let optionEl = document.createElement('option')
         optionEl.value = filteredCity.istat_id
         optionEl.innerHTML = [filteredCity.comune, filteredCity.provincia, filteredCity.regione].join(',')
         return optionEl
      }))
   })

   fetch('/api/cities').then(res => {
      res.json().then(data => cities = data)
      $('#cittaRicerca').trigger('input', { value: " " })
   })
})()