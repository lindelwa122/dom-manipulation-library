const generateContent = () => {
    const _createElement = (tagName, options = {}) => {
      const el = document.createElement(tagName);
  
      if (options.classList) {
        el.classList = options.classList.join(" ");
      }
  
      if (options.innerHTML) {
        el.innerHTML = options.innerHTML;
      }
  
      if (options.style) {
        createStyleSheet.addStyle(el, options.style);
      }
  
      return el;
    };
  
    const _createImage = (options) => {
      const img = new Image();
      img.src = options.src;
      img.alt = options.alt;
  
      if (options.style) {
        createStyleSheet.addStyle(img, options.style);
      }
  
      return img;
    };
  
    const _createTreeNode = (tree) => {
      const el =
        tree.tagName === "img"
          ? _createImage(tree.options)
          : _createElement(tree.tagName, tree.options);
  
      if (tree.children) {
        for (const child of tree.children) {
          const childEl = _createTreeNode(child);
          el.appendChild(childEl);
        }
      }
  
      if (tree.options && tree.options.router) {
        router.configRouter(
          Object.assign({}, tree.options.router, { element: el })
        );
      }
  
      tree.options && tree.options.pageId && router.pages.push(tree);
  
      return el;
    };
  
    const addTreeToTheDOM = (tree) => {
      const el = _createTreeNode(tree);
      // clear content
      document.querySelector("#content").innerHTML = "";
      document.querySelector("#content").appendChild(el);
      createStyleSheet.reRenderCSSRules();
    };
  
    return { addTreeToTheDOM };
  };
  
  export default generateContent().addTreeToTheDOM;

  const readContent = () => {

    /*checks attribute or property is valid or not 
    if property returns object invalid eg style... 
    if returns string valid eg innerHTML*/

    const attributeValidation = (attributeName,attributeValue) => {
      if(attributeName !== "" && (!attributeValue || typeof(attributeValue) === "object")) {
        console.error("Please check the attribute either you went wrong in the parameter or please add it in the specified HTML Element");
        throw new Error("The attribute name mentioned is not qualified");
      } 
    }

    /* checks if the property can be pushed or not,if valid (string) property push it else
    property returning object(invalid) dont push throw error */
    const arrayValidation = (attributeName,attributeValue) => {
      return (typeof(attributeValue) === "object") ? 
      attributeValidation(attributeName,attributeValue) : attributeValue;
    }

    const read = (selector, attributeName="", all=false) => {
        
        /* to make attribute parameter optional the user gives 
        either nothing (empty string) or bool if attribute name not specified*/
         
        if (typeof(attributeName) === "boolean") {
          all = attributeName;
          attributeName = "";
        }

        // conditional selection
        const el = (!all ? document.querySelector(selector) : 
        document.querySelectorAll(selector));

        let attributeValue;
        
        // invalid selector
        if (!el || el.length === 0) {
          console.error("Retrieving of the element was not possible. Please check your selector.");
          throw new Error("Element was not selected from the DOM");
        }

        // when all is false and attribute is valid
        if (!all && attributeName && el.getAttribute(attributeName)) {
          attributeValue = el.getAttribute(attributeName);      
          return attributeValue;
        } 

        /* when all is false and the attribute is undefined check if its a valid property */
        if (!all && !el.getAttribute(attributeName) &&
         el[attributeName]) {
          return typeof(el[attributeName]) === "object"
          ? attributeValidation(attributeName,attributeValue): el[attributeName];
        }

        // validation for wrong attribute and invalid property when all is false
        (!all && !el.getAttribute(attributeName)) && 
        attributeValidation(attributeName,attributeValue);

        // checking if property or attribute when all is true
        if (all && (el[0].getAttribute(attributeName) || 
          el[0][attributeName])) {

          const _attributes = [];

          /* push if "valid attribute" or "valid property"
          if invalid throws an error to check attributes */

          el.forEach((element) => {
              _attributes.push(element.getAttribute(attributeName) ||
              arrayValidation(attributeName,element[attributeName]));
          })

          return _attributes;
        }

        // validation for wrong attributes when all is true
        (all && !el[0].getAttribute(attributeName)) && 
        attributeValidation(attributeName,attributeValue);

        /* returns the element when attribute not specified or
         valid attributes and properties given*/
        return el;
    }

    return { read };
  }

  export { readContent };
  
  const createStyleSheet = (() => {
    const addStyle = (el, declaration) => {
      for (const val of Object.entries(declaration)) {
        const property = val[0];
        const value = val[1];
  
        el.style[property] = value;
      }
    };
  
    const _CSSRules = [];
    const reRenderCSSRules = () => {
      for (const rule of _CSSRules) {
        createCSSRule(rule, false);
      }
    };
  
    const createCSSRule = (style, save=true) => {
      save && _CSSRules.push(style);
  
      for (const val of Object.entries(style)) {
        const selector = val[0];
        const declaration = val[1];
  
        const elements = document.querySelectorAll(selector);
  
        elements.length > 0 &&
          elements.forEach((el) => {
            addStyle(el, declaration);
          });
      }
    };
  
    return { addStyle, createCSSRule, reRenderCSSRules };
  })();
  
  export { createStyleSheet };
  
  const router = (() => {
    const pages = [];
    const _routers = [];
  
    const configRouter = (info) => {
      _routers.push(info);
  
      info.element.addEventListener("click", () => {
        _deactive(info.name);
        console.log({ ele: info.element })
        info.element.classList.add("active");
  
        let to;
        for (const page of pages) {
          if (page.id === info.to) {
            to = page.route;
          }
        }
  
        generateContent().addTreeToTheDOM(to);
      });
    };
  
    const _deactive = (name) => {
      for (const router of _routers) {
        if (router.name === name) {
          router.element.classList.remove("active");
        }
      }
    };
  
    const register = (routes) => {
      for (const route of routes) {
        pages.push(route);
      }
    };
  
    return { configRouter, register, pages };
  })();
  
  export { router };