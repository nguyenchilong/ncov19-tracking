const btnSubscribe = document.getElementById("btnSubscribe");
const subscribeForm = document.getElementById("subscribeForm");

btnSubscribe.addEventListener("click", submitForm => {
   btnSubscribe.setAttribute("disabled", "disabled");
    subscribeForm.submit();
});
