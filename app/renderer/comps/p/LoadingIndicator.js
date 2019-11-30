import React, { PureComponent } from "react"

class LoadingIndicator extends PureComponent {
  static defaultProps = {
    width: 16,
    height: 16,
    leftColor: "#333",
    middleColor: "#8f8f94",
    rightColor: "#333",
  }

  render() {
    const { leftColor, middleColor, rightColor, className } = this.props

    return (
      <svg
        height={this.props.height}
        width={this.props.width}
        version="1.1"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        xmlSpace="preserve"
        className={className}
      >
        <g fill={middleColor}>
          <g className="nc-loop_bars-16">
            <rect
              height="10"
              style={{ opacity: "0.8429340000078083" }}
              width="2"
              transform="translate(0 1.2565279999375343) scale(1 0.8429340000078083)"
              x="7"
              y="3"
            />
            <rect
              height="10"
              style={{ opacity: "0.5570659999921919" }}
              width="2"
              fill={leftColor}
              transform="translate(0 3.5434720000624655) scale(1 0.5570659999921919)"
              y="3"
            />
            <rect
              height="10"
              style={{ opacity: "0.5570659999921919" }}
              width="2"
              fill={rightColor}
              transform="translate(0 3.5434720000624655) scale(1 0.5570659999921919)"
              x="14"
              y="3"
            />
          </g>
          <script
            dangerouslySetInnerHTML={{
              __html:
                '!function(){function t(t,i){for(var n in i)t.setAttribute(n,i[n])}function i(t){this.element=t,this.rect=[this.element.querySelectorAll("*")[0],this.element.querySelectorAll("*")[1],this.element.querySelectorAll("*")[2]],this.animationId,this.loop=0,this.start=null,this.init()}if(!window.requestAnimationFrame){var n=null;window.requestAnimationFrame=function(t,i){var e=(new Date).getTime();n||(n=e);var o=Math.max(0,16-(e-n)),r=window.setTimeout(function(){t(e+o)},o);return n=e+o,r}}i.prototype.init=function(){var t=this;this.loop=0,this.animationId=window.requestAnimationFrame(t.triggerAnimation.bind(t))},i.prototype.reset=function(){var t=this;window.cancelAnimationFrame(t.animationId)},i.prototype.triggerAnimation=function(i){var n=this;this.start||(this.start=i);var e=i-this.start,o=[],r=[],a=1-2*e/1e3,s=2*e*8/1e3,l=.4+2*e/1e3,m=8*(.6-2*e/1e3);this.loop%2==0?(o[0]=a,r[0]=s,o[1]=o[2]=l,r[1]=r[2]=m):(o[0]=l,r[0]=m,o[1]=o[2]=a,r[1]=r[2]=s),300&gt;e||(this.start=this.start+300,this.loop=this.loop+1);for(var c=0;3&gt;c;c++)t(this.rect[c],{transform:"translate(0 "+r[c]+") scale(1 "+o[c]+")",style:"opacity:"+o[c]+";"});if(document.documentElement.contains(this.element))window.requestAnimationFrame(n.triggerAnimation.bind(n))};var e=document.getElementsByClassName("nc-loop_bars-16"),o=[];if(e)for(var r=0;e.length&gt;r;r++)!function(t){o.push(new i(e[t]))}(r);document.addEventListener("visibilitychange",function(){"hidden"==document.visibilityState?o.forEach(function(t){t.reset()}):o.forEach(function(t){t.init()})})}();',
            }}
          />
        </g>
      </svg>
    )
  }
}

export default LoadingIndicator
