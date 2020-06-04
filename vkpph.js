(function () { // anonymous self-calling function to avoid name collisions
let checked = {}; // hash of already being checking or checked users, keys are screen_names values are statuses (0 - checking, 1 - open profile, 2 - private)
let pending = []; // list of users to check
const vk_path = "https://vk.com/";
const token = "83821776838217768387f3f5d783d87c348838283821776db4a62ffd123eb33245671c3"; // Service token
const api_url = "https://api.vk.com/method/users.get?fields=screen_name&name_case=nom&access_token="+token+"&v=5.107&user_ids="; // URL of users.get method

function fill_users(slct) { // finds all links to users by given CSS selector and puts them to pending list
  let people = document.querySelectorAll(slct);
  for (let i=0;i<people.length; i++) {
    let userid = people[i].href.substr(vk_path.length);
    if (!(userid in checked)) {
        checked[userid]=0;
        pending.push(userid);
    }
  }
}

function make_req_func(users,last) { // simple closure to make functions to call with setTimeout
  return function() {
    const full_api_url = api_url + users.join(","); // building URL to call
    fetch(full_api_url).then(function(response) { // using fetch to get data
      if (response.status == 200) { // if data received, converting it to JSON
        return response.json();
      }
    }).then(function (data) { // and saving user statuses in checked
      for (let i=0; i<data.response.length; i++) {
         checked[data.response[i].screen_name]=data.response[i].is_closed ? 2 : 1; // 2 for private profiles, 1 for open profile
      }
      if (last) mark_users(); // if it is last call, then calling function to add class to private user links
    }).catch(console.log);
  }
}
function do_request() {
  const per_page=100;
  const timer_step=334;
  let timer = 0
  for (let start=0; start<pending.length;) { // splitting all pending user to 100 per block and making 3 request per second due to vk.com limitations
    setTimeout(make_req_func(pending.slice(start,start+per_page),true),timer);  // spawning each request
    start=start+per_page;
    timer=timer+timer_step;
  }
  pending=[];
}
function mark_users() {
   for (user in checked) {
     if (checked[user]==2) { // only for private user
       let elms=document.querySelectorAll('a[href="/'+user+'"]'); // finding all user links
       for (let i=0; i<elms.length; i++) { 
           elms[i].classList.add("vkpph_private");  // and adding class vkpph_private
        }
     }
   }
}
function process(param) {
  if (param==null ||  (param[0].target.className!='im-page--title-status _im_page_status' && param[0].target.className!='im-page--title-meta _im_page_peer_online')) {
    fill_users('.people_cell_ava');
    fill_users('.post_image');
    fill_users('.friends_photo');
    fill_users('.right_list_photo');
    fill_users('.reply_image');
    fill_users('.like_tt_owner');
    fill_users('a.friend_recomm_card');
    do_request();
  }
}
function clear_cache() {
    checked={}
}

process(null); // starting for the first time
let observer = new MutationObserver(process); // and starting to observe, if new elements arrive to restart process function and update highlights
observer.observe(document.getElementById('page_body'),{attributes: false, childList: true, characterData: false, subtree:true});
setInterval(clear_cache,2*24*60*60*1000); // clear checked users cache each 2 days for those, who never turns off computer

})();
