import DataroomElement from 'dataroom-js';

class RouterComponent extends DataroomElement {
  async initialize(){
    console.log("initialized router component");

    window.addEventListener('hashchange', () => {
      this.findRoute();
    });

    this.findRoute();

  }

  findRoute(){
    console.log("route change");
    this.values = this.getURLValues();
    console.log(this.values);
    if(this.values.md){
      console.log("route changed event", this.values)
      this.event("ROUTE-CHANGED", this.values.md)
    }
  }

  getURLValues(URL = window.location.href ){
    const search_params = new URLSearchParams(URL)
    let options = {}
    for (const [key, unparsed_value] of search_params) {
      if(key !== window.location.origin + window.location.pathname + '?' ){
        try {
          const value = JSON.parse(decodeURI(unparsed_value))
          options[key] = value
        } catch {
          options[key] = decodeURI(unparsed_value)
        }
      }
    }
    return options
  }

  setURLValues(obj){
    let url = window.location.origin + window.location.pathname + '?'
    Object.keys(obj).forEach(key => {
      url += `&${key}=${obj[key]}`
    })
    history.pushState(obj, '', url)
  }
}

customElements.define('router-component', RouterComponent)
