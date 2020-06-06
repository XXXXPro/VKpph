const token = "83821776838217768387f3f5d783d87c348838283821776db4a62ffd123eb33245671c3"; // Service token
const api_url = "https://api.vk.com/method/users.get?fields=screen_name&name_case=nom&access_token="+token+"&v=5.107&user_ids="; // URL of users.get method

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    const full_api_url = api_url + request.join(","); // building URL to call
    fetch(full_api_url,{credentials:'omit'}).then(function(response) { // using fetch to get data
      if (response.ok && response.status == 200) { // if data received, converting it to JSON
        response.json().then(sendResponse);
      }
    }).catch(param=>sendResponse({}));
    return true;  // Will respond asynchronously.
  }
);