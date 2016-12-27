export function getAllUrlParams(url) {
    let queryString = url ? url.split('?')[1] : window.location.search.slice(1); // get query string from url (optional) or window
    let obj = {}; // we'll store the parameters here
    if (queryString) { // if query string exists
        queryString = queryString.split('#')[0]; // stuff after # is not part of query string, so get rid of it
        let arr = queryString.split('&'); // split our query string into its component parts
        for (let i = 0; i < arr.length; i++) {
            let a = arr[i].split('='); // separate the keys and the values
            let paramNum = undefined; // in case params look like: list[]=thing1&list[]=thing2
            let paramName = a[0].replace(/\[\d*\]/, function(v) {
                paramNum = v.slice(1, -1);
                return '';
            });
            let paramValue = typeof(a[1]) === 'undefined' ? true : a[1]; // set parameter value (use 'true' if empty)
            // paramName = paramName.toLowerCase(); // (optional) keep case consistent
            // paramValue = paramValue.toLowerCase();
            if (obj[paramName]) { // if parameter name already exists
                if (typeof obj[paramName] === 'string') { // convert value to array (if still string)
                    obj[paramName] = [obj[paramName]];
                }
                if (typeof paramNum === 'undefined') { // if no array index number specified...
                    obj[paramName].push(paramValue); // put the value on the end of the array
                } else { // if array index number specified...
                    obj[paramName][paramNum] = paramValue; // put the value at that index number
                }
            } else { // if param name doesn't exist yet, set it
                obj[paramName] = paramValue;
            }
        }
    }
    return obj;
}
