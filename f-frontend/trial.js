function loadPage(url){
    document.getElementById("mainFrame").src = url;
}

async function validate(event){
    if(event){
        event.preventDefault();
    }
    let f = document.f1.from.value;
    let t = document.f1.to.value;
    if(!f||!t){
        alert('Please select both from and to dates');
    }
    let from = new Date(f);
    let to = new Date(t);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        alert("Invalid Date Selected");
        return false;
    }
    let today = new Date();
    today.setHours(0,0,0,0);
    from.setHours(0,0,0,0);
    to.setHours(0,0,0,0);

    let fromDay = from.getTime();
    let toDay = to.getTime();
    let num_days = (toDay-fromDay)/(1000*60*60*24);
    num_days+=1;
    if(num_days>5){
        alert('cannot take leave for more than 5 days');
        return false;
    }

    let type = document.f1.type.value;
    if(!type){
        alert('Pick your leave type');
        return false;
    }

    const data = {
        from : f,
        to : t,
        type : type
    }
    try{
    const response = await fetch('http://localhost:4000/faculty/apply',{
        method : 'POST',
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data),
        credentials : "include"
    })

     const result = await response.json();
    if(response.ok){
        alert('Leave applied successfully!');
        window.location.href='home.html';
        return true;
    }
    else{
        alert(`Failed: ${result.message}|| Unknown error`);
        return false;
    }
}
  catch(err){
    console.error(`Network error : ${err}`);
    alert(`Server connection failed. Is backend running?`);
    return false;
  }
}