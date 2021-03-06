import React, { useEffect } from "react";

export default function Comments(): JSX.Element {

  useEffect(() => {
    const script = document.createElement("script");
    const anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "async");
    script.setAttribute("repo", "eulaludmila/desafio05-reactjs-criando-um-projeto-do-zero");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "dark-blue");
    anchor.appendChild(script);
  }, [])

  return (
    <div id="inject-comments-for-uterances"></div>
  );
}