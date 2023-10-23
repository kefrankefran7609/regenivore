console.log("hey shoppp")

/***** Authentication *****/ 
window.onload = async () => {
    // Find auth token cookie
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim(); 
    if (cookie.startsWith("regen" + '=')) {
    auth = cookie.substring("regen".length + 1)
    }
  } 
    if(auth){
    //Authenticate user and get his items
    authUser(auth)
} else {
   // location.href = "https://regenivore.webflow.io/auth/log-in"
    document.querySelectorAll('[showloggedout]').forEach(el => el.style.display = "block")
    document.querySelector('[savingstext]').textContent = "You would save"
}
}

const URL = "https://x8ki-letl-twmt.n7.xano.io/api:AYHeingS/"
var userid
// Auth user 
async function authUser(auth) {
	try{ 
  const res = await fetch(URL + "auth/me", {
 method: 'GET',
 headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': window.location.href,
        'Authorization': 'Bearer ' + auth
      }
 })
 console.log(res)
 if(res.status === 200){
 const data = await res.json()
 userid = data.id
 document.querySelectorAll('[showloggedin]').forEach(el => el.style.display = "block")
} else { 
document.querySelectorAll('[showloggedout]').forEach(el => el.style.display = "block")
document.querySelector('[savingstext]').textContent = "You would save"
}
} catch(error){
  document.querySelectorAll('[showloggedout]').forEach(el => el.style.display = "block")
  document.querySelector('[savingstext]').textContent = "You would save"
  console.log('error:', error);
  throw error;
  }
} 

/***** Filtration, sorting to get services  *****/
// Declaring all variables 
var categories = ["default"] // for filtration
var products = ["default"] // for filtration
var hasLocation = false
var location  //for filtration
var distance //for filtration
var search //for filtration
const checkboxesProducts = document.querySelectorAll('input[products]')
const checkboxesCategories = document.querySelectorAll('input[categories]')
searchInput = document.querySelector('[search]')


// Initial products load
filterItems()

// Show distance options and trigger distance filtering when a town is selected 
document.querySelector('[town]').addEventListener('change', (e) => {
    console.log(e.target.value)
    if(e.target.value != "all") {
    document.querySelector('[distancewrapper]').style.display = "flex"
    location = e.target.value
    distance = document.querySelector('[distance]').value
    hasLocation = true
    filterItems()
    }
    else {
    document.querySelector('[distancewrapper]').style.display = "none"
    hasLocation = false
    filterItems()
    }  
    })

// Show distance options and trigger distance filtering when a distance is selected 
document.querySelector('[distance]').addEventListener('change', (e) => {
    console.log(e.target.value)
    distance = e.target.value
    filterItems()
    })


// reset products filter
document.querySelector('[resetproducts]').addEventListener('click', () => {
  products = ["default"]
  filterItems()
  console.log(checkboxesProducts)
  checkboxesProducts.forEach(el => {
    el.previousSibling.classList.remove('w--redirected-checked')
  })
})

// reset categories filter
document.querySelector('[resetoptions]').addEventListener('click', () => {
  categories = ["default"]
  filterItems()
  console.log(checkboxesCategories)
  checkboxesCategories.forEach(el => {
    el.previousSibling.classList.remove('w--redirected-checked')
  })
})

// Create array with product checkboxes that are checked
document.querySelectorAll('input[products]').forEach((field) => {
	field.addEventListener('change', () => {
    productsChecked = Array.from(Array.from(checkboxesProducts).filter((checkbox) =>   checkbox.checked).map((check) => check.id)) 
    if(productsChecked.length == 0){
      products = ["default"]
    } else {
      products = []
      products.push(productsChecked)}
  filterItems()
}) })

// Create array with category checkboxes that are checked
document.querySelectorAll('input[categories]').forEach((field) => {
	field.addEventListener('change', () => {
  categoriesChecked = Array.from(Array.from(checkboxesCategories).filter((checkbox) =>   checkbox.checked).map((check) => check.id)) 
  if(categoriesChecked.length == 0){
    categories = ["default"]
  } else {
    categories = []
    categories.push(categoriesChecked)}
  filterItems()
}) })

// Get value from search input
searchInput.addEventListener('keyup', (e) => {
    console.log(e.target.value)
    search = e.target.value
    filterItems()
})

// Function to get items
async function filterItems() {
	try{
  const res = await fetch("https://x8ki-letl-twmt.n7.xano.io/api:AYHeingS/regenivore_main_inventory?categories=" + categories + "&products=" + products + (search == "" || search == undefined ? "" : "&search=" + search )
  + (hasLocation == false ? "&hasLocation=false" : "&hasLocation=true&location=" + location + "&distance=" + distance), {
 method: 'GET',
 headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': window.location.href
      }
 })
  console.log(res)
  const data = await res.json()
  console.log(data)
  console.log(data.items)
  const result = await updateList(data) ;  
  } catch(error){
  console.log('error:', error);
  throw error;
  }
}

// Create item from template
var firstCall = true
async function updateList(data) { 
  if(firstCall == false){
      // Remove all items apart from first one which is the template
      const list = document.querySelector('[itemswrapper]')
      while(list.children.length > 1)
      list.removeChild(list.lastChild)
      // Remove all reviews apart from first one which is the template
      /*const reviewslist = document.querySelector('[reviews]')
      while(reviewslist.children.length > 1)
      reviewslist.removeChild(reviewslist.lastChild)*/
      window.location.href="#scrollTop"
    }
    var itemss = data.items
    if(hasLocation){
    /*****  Remove non available items  *****/
    // Filtering the products that are unavailable in the farmers in the range selected
    const availableFruits = [];
    for (const farmerKey in data.farmers) {
    const farmer = data.farmers[farmerKey];
    for (const fruitKey in farmer) {
    if (farmer[fruitKey].isAvailable) {
      availableFruits.push(fruitKey);
    }}}
    const fruits = [...new Set(availableFruits)] //Removing duplicates
    console.log(fruits)
    // Filtering the filtered item and removing the ones that are unavailable
    const inventoryArray = Object.keys(data.items).map((key) => ({ id: key, ...data.items[key] })) // Creating an array that can be filtered
    itemss = inventoryArray.filter((product) => fruits.includes(product.name))
    console.log(itemss)
    }
    if(itemss != 0){
    const itemTemplate = document.querySelector('[item]')
    const itemList = itemTemplate.parentElement
    const reviewTemplate = document.querySelector('[itemreview]')
    //mapping through items on the page
    const items = itemss.map(({id, name, image, unit, units, priceUnit, priceUnits, numberUnit, numberUnits, products, categories, reviews}) => {
    const item = itemTemplate.cloneNode(true)
    item.querySelector('[names]').textContent = name
    item.querySelector('[image]').src = image.url
    item.querySelectorAll('[unit]')[0].textContent = unit.split('-')[0] + " - "
    item.querySelectorAll('[unit]')[1].textContent = units.split('-')[0] + " - "
    item.querySelectorAll('[number]')[0].textContent = numberUnit
    item.querySelectorAll('[number]')[1].textContent = numberUnits
    item.querySelectorAll('[price]')[0].textContent = priceUnit.toFixed(2)
    item.querySelectorAll('[price]')[1].textContent = priceUnits.toFixed(2)
    item.querySelectorAll('[quantity]')[0].setAttribute("item-name", name)
    item.querySelectorAll('[quantity]')[1].setAttribute("item-name", name + "s")
    item.querySelector('[superfood]').style.display = categories.includes("Superfood") ? "block" : "none"
    item.querySelector('[criollo]').style.display = categories.includes("Criollo") ? "block" : "none"
    item.querySelector('[regenerative]').style.display = categories.includes("Regenerative") ? "block" : "none"

    var reviewss
    if(reviews.length > 0){
       var ratings =[]
       var users = []
    // if there are reviews for this item, mapping through them
     reviewss = reviews.map(({title, review, rating, who, lac_users_id}) => {
       const revieww = reviewTemplate.cloneNode(true)
       revieww.querySelector('[reviewtitle]').textContent = title
       revieww.querySelector('[review]').textContent = review
       revieww.querySelector('[reviewrating]').textContent = rating
       revieww.querySelector('[reviewwho]').textContent = who
       revieww.querySelector('[itemid]').textContent = id
       // Show delete button on reviews that are from this user, add a delay to be sure that auth is finished
       setTimeout(() => {
       if(lac_users_id == userid) revieww.querySelector('[showdeletereview]').style.display = "flex"
       }, 1000)
       ratings.push(rating)
       users.push(lac_users_id)
       // Hide-show elements if there are reviews for this item
       item.querySelector('[noreview]').style.display = "none"
       item.querySelector('[showreviews]').style.display = "block"  
       item.querySelector('[reviewsaveragerow]').style.display = "flex"
       return revieww    
     })
    } else {
    // Hide-show elements if there is no review for this item
    /*item.querySelector('[noreview]').style.display = "block"
    item.querySelector('[showreviews]').style.display = "none"  
    item.querySelector('[reviewsaveragerow]').style.display = "none" */
    }
    // Append reviews to the item

    if(reviews.length > 0) {
    console.log(users)
    // Hide the leave a review button if the user already left a review for this item, add a delay to be sure that auth is finished
    setTimeout(() => {
    const user = users.filter(use => use === 13)
    if(user.length > 0) item.querySelector('[leavereview]').style.display = "none"
    }, 1000)
    // Calculate average of ratings 
    const sum = ratings.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    item.querySelector('[reviewaverage]').textContent = (sum / ratings.length).toFixed(2)
    // Displaying the number of reviews for this item
    item.querySelector('[reviewnumber]').textContent = ratings.length == 1 ? ratings.length + " review" : ratings.length + " reviews"
    item.querySelector('[reviews]').append(...reviewss)
    }
    //item.querySelector('[reviews]').firstElementChild.style.display = "none"
    return item
    })
    itemList.append(...items)
    document.querySelectorAll('[item]').forEach(el => {
      el.style.display = "flex"
    })
    itemList.firstElementChild.style.display = "none"
    }
    console.log("hey")

    // Behavior for quantity fields
    // Setting all fields to 0
    const quantity = document.querySelectorAll('[quantity]')
    const cart = document.querySelectorAll('[addtocart]')
    quantity.forEach(el => {
      el.value = 0
    })

    // Keeping fields from going under 0
    quantity.forEach((el, i) => { 
    el.addEventListener('change', (e) => {
      // Display cart button if one of the 2 input has a value higher than 0
      if(i % 2 === 0) cart[Math.floor(i/2)].style.display = e.target.value > 0 || quantity[i+1].value  > 0 ? "flex" : "none"
      else cart[Math.floor(i/2)].style.display = e.target.value > 0 || quantity[i-1].value > 0 ? "flex" : "none"
      if(e.target.value < 0) e.target.value = 0 
      })
    })

    // Plus button
    document.querySelectorAll('[plus]').forEach((btn, i) => {
      btn.addEventListener('click', () => {
      quantity[i].value++
      if(i % 2 === 0) cart[Math.floor(i/2)].style.display = quantity[i].value > 0 || quantity[i+1].value  > 0 ? "flex" : "none"
      else cart[Math.floor(i/2)].style.display = quantity[i].value > 0 || quantity[i-1].value > 0 ? "flex" : "none"
      })
    })

    // Minus button
    document.querySelectorAll('[minus]').forEach((btn, i) => {
      btn.addEventListener('click', () => {
      quantity[i].value--
      if(i % 2 === 0) cart[Math.floor(i/2)].style.display = quantity[i].value > 0 || quantity[i+1].value  > 0 ? "flex" : "none"
      else cart[Math.floor(i/2)].style.display = quantity[i].value > 0 || quantity[i-1].value > 0 ? "flex" : "none"
      if(quantity[i].value < 0) quantity[i].value = 0
      })
    })


 // console.log(data.items)    
  //currentPage.textContent = data.curPage
  //document.querySelector('[totalpages]').textContent = data.pageTotal + " pages"
    document.querySelector('[itemsonpage]').textContent = itemss.length
  //document.querySelector('[numberofitemsonpage]').textContent = data.itemsReceived
  //nextPage = data.nextPage
  //prevPage = data.prevPage
 // document.querySelector('[nextpage]').style.display = nextPage === null ? "none" : "flex"
  //document.querySelector('[prevpage]').style.display = prevPage === null ? "none" : "flex"    
    document.querySelector('#noresultwrapper').style.display = itemss.length == 0 ? "flex" : "none"
 // document.querySelector('[pagination]').style.display = data.pageTotal == 0 ? "none" : "flex"
    firstCall = false
    setTimeout(() => {
      document.querySelector('[loaderwrapper]').style.display = "none"
      document.querySelector('[loadingcontent]').classList.add('show')

// Show item full details popup
const ifd = document.querySelectorAll('[itemfulldetails]')
document.querySelectorAll('[itembutton]').forEach((btn, index) => {
    btn.addEventListener('click', () => { 
    ifd[index].classList.add('show')
    ifd[index].style.pointerEvents = "auto"
    document.body.style.overflow = "hidden" //Disable page scroll
  })
})

document.querySelectorAll('[itemimagelink]').forEach((btn, index) => {
  btn.addEventListener('click', () => { 
  ifd[index].classList.add('show')
  ifd[index].style.pointerEvents = "auto"
  document.body.style.overflow = "auto" //Enable page scroll
})
})

// Hide item full details popup
document.querySelectorAll('[itemclosefulldetails]').forEach((btn, index) => {
  btn.addEventListener('click', () => { 
  ifd[index].classList.remove('show')
  document.body.style.overflow = "auto"
  setTimeout(() => {
  ifd[index].style.pointerEvents = "none"
    }, 750)  
  })
})


/**** Reviews *****/
// Show reviews
const createReviews = document.querySelectorAll('[createreview]')
const reviewSidebar = document.querySelectorAll('[reviewsidebar]')
const reviews = document.querySelectorAll('[reviewswrapper]')
document.querySelectorAll('[showreviews]').forEach((btn, index) => {
  btn.addEventListener('click', () => {  
  reviewSidebar[index].classList.add('show')
  createReviews[index].classList.remove('show')
  createReviews[index].style.pointerEvents = "none"
  setTimeout(() => {
  reviews[index].classList.add('show')
  }, 400)
})
})

// Show create review
document.querySelectorAll('[leavereview]').forEach((btn, index) => {
  btn.addEventListener('click', () => { 
  reviewSidebar[index].classList.add('show')
  reviews[index].classList.remove('show')
  createReviews[index].style.pointerEvents = "auto"
  setTimeout(() => {
  createReviews[index].classList.add('show')
  }, 400)
})
})

// Close review sidebar
document.querySelectorAll('[closereviews]').forEach((btn, index) => {
  btn.addEventListener('click', () => { 
  //document.querySelectorAll('[reviewsuccess]')[index].style.pointerEvents = "auto"
  reviews[index].classList.remove('show')
  createReviews[index].classList.remove('show')
  setTimeout(() => {
  reviewSidebar[index].classList.remove('show')
  }, 500)
})
})

// Show delete review
document.querySelectorAll('[showdeletereview]').forEach(btn => {
    btn.addEventListener('click', () => {
    btn.nextSibling.classList.add('show')
    btn.nextSibling.style.pointerEvents = "auto"
    })
})

// Cancel delete review
document.querySelectorAll('[canceldeletereview]').forEach(btn => {
    btn.addEventListener('click', () => {
    btn.parentElement.classList.remove('show')
    btn.parentElement.style.pointerEvents = "none"
  })
})

// Keep values of review's rating between 0 and 5
document.querySelectorAll('[reviewRating]').forEach((input, index) => {
  input.addEventListener('change', (e) => {
    if(e.target.value < 0) e.target.value = 0
    if(e.target.value > 5) e.target.value = 5
  })
})


// Hide scroll text images on hover
document.querySelectorAll('[itemimagescomponent]').forEach((input, index) => {
  input.addEventListener('mouseenter', () => {
    document.querySelectorAll('[itemimagescroll]')[index].classList.add('hide')  
  })
})

// Hide scroll text images on hover
document.querySelectorAll('[itemimagescomponent]').forEach((input, index) => {
  input.addEventListener('mouseleave', () => {
    document.querySelectorAll('[itemimagescroll]')[index].classList.remove('hide')  
  })
})

// Create review
  document.querySelectorAll('[submitreview]').forEach((btn, index) => {
  const revTitle = document.querySelectorAll('[createreviewtitle]')[index]
  const revText = document.querySelectorAll('[createreviewtext]')[index]
  const revRating = document.querySelectorAll('[createreviewrating]')[index]
  btn.addEventListener('click', async (e) => {  
  e.preventDefault()  
  if(revTitle.value && revText.value && revRating.value){
  // Putting all the review fields into an object
  const rawReview = {
    title: revTitle.value,
    review: revText.value,
    rating: +revRating.value,
    who: who,
    lac_users_id: userid
  }
  const realReview = JSON.stringify(rawReview)
  urlencoded = new URLSearchParams()
  urlencoded.append("review", realReview)
  urlencoded.append("id", data.items[index - 1].id)
  urlencoded.append("userid", userid)
  try{
      const res = await fetch(URL + "services/" + data.items[index - 1].id,
      {
      method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          'Access-Control-Allow-Origin': '*'
        },
        body:urlencoded
      })
      console.log(res)
      if(res.status === 200){
        document.querySelectorAll('[reviewsuccess]')[index].classList.add('show')
        document.querySelectorAll('[leavereview]')[index].style.display = "none"
        //Close the review sidabar after success
        setTimeout(() => {
          reviews[index].classList.remove('show')
          createReviews[index].classList.remove('show')
            setTimeout(() => {
            reviewSidebar[index].classList.remove('show')
            }, 500)
        }, 2000)
          setTimeout(() => {
          document.querySelectorAll('[reviewsuccess]')[index].classList.remove('show')
          revTitle.classList.remove('active')
          revText.classList.remove('active')
          revRating.classList.remove('active')
          revTitle.value = ""
          revText.value = ""
          revRating.value = ""        
          }, 4000)
        // Add new review live
       const newReviewWrapper = document.querySelectorAll('[itemfulldetails]')[index]
       const newReview = newReviewWrapper.querySelectorAll('[itemreview]')[0].cloneNode(true)
       newReview.querySelector('[reviewtitle]').textContent = revTitle.value
       newReview.querySelector('[review]').textContent = revText.value
       newReview.querySelector('[reviewrating]').textContent = +revRating.value
       newReview.querySelector('[reviewwho]').textContent = who
       newReview.querySelector('[itemid]').textContent = data.items[index - 1].id
       newReview.style.display = "flex"
       // Hide and show related elements
       document.querySelectorAll('[reviews]')[index].append(newReview)
       document.querySelectorAll('[reviewsaveragerow]')[index].style.display = "flex"
       document.querySelectorAll('[showreviews]')[index].style.display = "block"
       newReview.querySelector('[showdeletereview]').style.display = "flex"
       newReview.querySelector('[showdeletereview]').addEventListener('click', (e) => {
       e.target.nextSibling.classList.add('show')
       e.target.nextSibling.style.pointerEvents = "auto"
       })
       createDeleteReviewListener()
       document.querySelectorAll('[noreview]')[index].style.display = "none"
       const parts = newReviewWrapper.querySelector('[reviewnumber]').textContent.split(' ')
       var newReviewNumber = +parts[0] + 1
       newReviewWrapper.querySelector('[reviewnumber]').textContent = (newReviewNumber == 1 ? "1 review" : newReviewNumber + " reviews")
       const ratings = []
       numbers = (Array.from(newReviewWrapper.querySelectorAll('[reviewrating]'))).slice(1)
       numbers.forEach(div => {
       const number = parseFloat(div.textContent)
       ratings.push(number)
       const sum = ratings.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
       newReviewWrapper.querySelector('[reviewaverage]').textContent = (sum / ratings.length).toFixed(2)
    })
      }
      } catch(error){
      console.log('error:', error);
      throw error;
      }
  } else {
    console.log(revTitle.value)
    console.log(revText.value)
    console.log(revRating.value)
    if(!revTitle.value) revTitle.classList.add('empty'); else revTitle.classList.remove('empty')
    if(!revText.value) revText.classList.add('empty'); else revText.classList.remove('empty')
    if(!revRating.value) revRating.classList.add('empty'); else revRating.classList.remove('empty')
    document.querySelectorAll('[reviewerror]')[index].classList.add('show')
    setTimeout(() => {
    document.querySelectorAll('[reviewerror]')[index].classList.remove('show')  
    }, 3000)
  }
})
}) 
// End of create review

// Delete review 
createDeleteReviewListener()


function createDeleteReviewListener() {
  document.querySelectorAll('[deletereview]').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      deleteReview(index)
    })
  })
}

async function deleteReview(index){
  var deletereviewurl = new URLSearchParams()
  deletereviewurl.append("userid", userid)
  deletereviewurl.append("deleteReview", true)
  deletereviewurl.append("id", document.querySelectorAll('[itemid]')[index].textContent)
  try{
  const res = await fetch(URL + "services/" + document.querySelectorAll('[itemid]')[index].textContent,
  {
  method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      'Access-Control-Allow-Origin': '*'
    },
    body:deletereviewurl
  })
  console.log(res)
  if(res.status === 200){
  // Hiding the deleted review and related elements
  const itemReview = document.querySelectorAll('[itemreview]')[index]
  parent = itemReview.parentElement 
  fullItem = itemReview.closest('[itemfulldetails]')
  itemReview.remove() 
  fullItem.querySelector('[leavereview]').style.display = "block"
  if(parent.querySelectorAll('[itemreview]').length == 1){
  fullItem.querySelector('[reviewsaveragerow]').style.display = "none"
  fullItem.querySelector('[showreviews]').style.display = "none"
  // Close review sidebar   
  fullItem.querySelector('[noreview]').style.display = "block"
  fullItem.querySelector('[createreview]').classList.remove('show')
  fullItem.querySelector('[reviewswrapper]').classList.remove('show')
  setTimeout(() => {
    fullItem.querySelector('[reviewsidebar]').classList.remove('show')
  }, 500)
  }  else {
  // Calculate and display new average
  const ratings = []
  numbers = (Array.from(fullItem.querySelectorAll('[reviewrating]'))).slice(1)
  numbers.forEach(div => {
  const number = parseFloat(div.textContent)
  ratings.push(number)
  const sum = ratings.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  fullItem.querySelector('[reviewaverage]').textContent = (sum / ratings.length).toFixed(2)
  })
  // Display the new amount of reviews
  fullItem.querySelector('[reviewnumber]').textContent = parent.querySelectorAll('[itemreview]').length == 2 ? "1 review" : (parent.querySelectorAll('[itemreview]').length - 1) + " reviews"
  }  
    //Close the review sidabar after success
   /* setTimeout(() => {
      reviews[index].classList.remove('show')
      createReviews[index].classList.remove('show')
        setTimeout(() => {
        reviewSidebar[index].classList.remove('show')
        }, 500)
    }, 3000)*/
    }
  } catch(error){
  console.log('error:', error);
  throw error;
  }
}
// End of delete Review
/**** End of reviews *****/

/**** Cart operations *****/
// When clicking on cart button
var total = 0
const cart = document.querySelector('[cart]')
document.querySelectorAll('[addtocart]').forEach((btn, i) => {
    btn.addEventListener('click', () => {
    document.querySelector('[cartempty]').style.display = "none"
    btn.style.display = "none"
    // Displaying cart
    openCart()
    // Adding items to cart
    const itemWrapper = document.querySelectorAll('[item]')[i]

    // Add item to the cart
    itemWrapper.querySelectorAll('[quantity').forEach((el, index) => {
      if(el.value > 0){
        // Create a new item
          const currentItem = Array.from(document.querySelectorAll('[cartitem]')).filter(cartItem => cartItem.hasAttribute(el.getAttribute("item-name")))
          if(currentItem.length == 0){
          document.querySelector('[cartitem]').style.display = "flex"
          const itemTemplate = document.querySelector('[cartitem]')
          const item = itemTemplate.cloneNode(true)
          item.querySelector('[cartitemname]').textContent = itemWrapper.querySelector('[names]').textContent
          item.querySelector('[cartitemnumber]').textContent = itemWrapper.querySelectorAll('[quantity]')[index].value
          item.querySelector('[cartitemunit]').textContent = itemWrapper.querySelectorAll('[unit]')[index].textContent
          var itemPrice = (itemWrapper.querySelectorAll('[price]')[index].textContent * itemWrapper.querySelectorAll('[quantity]')[index].value).toFixed(2)
          item.querySelector('[cartitemprice]').textContent = itemPrice
          item.querySelector('[cartitemimage]').src = itemWrapper.querySelector('[image]').src
          item.setAttribute(index == 0 ? itemWrapper.querySelector('[names]').textContent : itemWrapper.querySelector('[names]').textContent + "s", "")
          item.querySelector('[cartitemprice]').setAttribute("price-name", index == 0 ? itemWrapper.querySelector('[names]').textContent : itemWrapper.querySelector('[names]').textContent + "s")
          item.querySelector('[cartitemnumber]').setAttribute("quantity-name", index == 0 ? itemWrapper.querySelector('[names]').textContent : itemWrapper.querySelector('[names]').textContent + "s")   
          // Create event listener to remove item in cart
          item.querySelector('[remove]').addEventListener('click', () => {
            item.remove()
            // Display the "empty cart" element if cart is empty

            document.querySelector('[cartempty]').style.display = document.querySelectorAll('[cartitem]').length < 2 ? "flex" : "none" 
            updateTotal()   
          })
          // Append item to the cart item list
          document.querySelector('[cartitems]').appendChild(item)
          document.querySelectorAll('[cartitem]').forEach(el => el.style.display = "flex")
          document.querySelector('[cartitems]').firstElementChild.style.display = "none"
          updateTotal()
        } else{
          // Update numbers on the frontend
          itemPrice = +document.querySelector(`[price-name="${el.getAttribute("item-name")}"]`).textContent + (itemWrapper.querySelectorAll('[price]')[index].textContent * itemWrapper.querySelectorAll('[quantity]')[index].value)
          document.querySelector(`[price-name="${el.getAttribute("item-name")}"]`).textContent = itemPrice.toFixed(2)
          const quantity = +document.querySelector(`[quantity-name="${el.getAttribute("item-name")}"]`).textContent +  +itemWrapper.querySelectorAll('[quantity]')[index].value
          document.querySelector(`[quantity-name="${el.getAttribute("item-name")}"]`).textContent = quantity
          updateTotal()
      }  el.value = 0; 
      }
    })
})
})

// Click see cart
document.querySelector('[seecart]').addEventListener('click', () => {
  openCart()
})


function updateTotal(){
  var nodes = document.querySelectorAll('[cartitemprice]')
  total = 0
  Array.from(document.querySelectorAll('[cartitemprice]')).forEach(node => {
    total += +node.textContent
  });
  document.querySelector('[total]').textContent = total.toFixed(2)
  document.querySelector('[savingsamount]').textContent = (total * 0.1).toFixed(2)
  if(total == 0) {
  document.querySelector('[cartbottom]').style.display = "none"
  document.querySelector('[cartitems]').style.display = "none"
  } else {
  document.querySelector('[cartbottom]').style.display = "flex"
  document.querySelector('[cartitems]').style.display = "flex"

  }
}
  function openCart(){
  cart.classList.add('show')
    setTimeout(() => {
        document.querySelector('[cartheading]').classList.add('show')    
    }, 300)
    setTimeout(() => {
        document.querySelector('[cartcontent]').classList.add('show')   
    }, 450)
    setTimeout(() => {
        document.querySelector('[closecart]').classList.add('show')   
    }, 600)
  }

// Close cart
document.querySelector('[closecart]').addEventListener('click', () => {
    setTimeout(() => {
        document.querySelector('[closecart]').classList.remove('show')    
    }, 150)
    setTimeout(() => {
        document.querySelector('[cartheading]').classList.remove('show')  
    }, 300)
    setTimeout(() => {
        document.querySelector('[cartcontent]').classList.remove('show')  
    }, 450)
    setTimeout(() => {
        cart.classList.remove('show')  
    }, 800)
})

}, 500)
}
/***** End of get items *****/



