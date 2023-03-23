import { Buffer, Blob } from "node:buffer";
import arc from "@architect/functions";
import Vips from "wasm-vips";

const viewWidth = 500;

// follows https://github.com/transitive-bullshit/lqip-modern/blob/master/index.js
const vips = await Vips();
const image = vips.Image.newFromFile("tbeseda.jpg");
const originalHeight = image.height;
const originalWidth = image.width;
const imgHeight = (originalHeight / originalWidth) * viewWidth;
const thumbnail = image.thumbnailImage(16, { size: "down" });
const { width: thumbnailWidth, height: thumbnailHeight } = thumbnail;
const webpBuffer = thumbnail.webpsaveBuffer({
	Q: 20,
	alpha_q: 20,
	smart_subsample: true,
	// lossless: true,
});
const webpData = Buffer.from(webpBuffer).toString("base64");
const uri = `data:image/webp;base64,${webpData}`;
const uriSize = new Blob([uri]).size;

// pre-rendered by lqip-modern
const _webpData =
	"UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoQAAwABUB8JZACsAECskSTgAAA/qa8jpAGc6IQElBvXNEs5BGoWUBYGUoTa2Qy3G2B0aaY4+58eqbpwhd3b0nfRiyPP9xSG3aKQAAA";
const _uri = `data:image/webp;base64,${_webpData}`;
const _uriSize = new Blob([_uri]).size;

export const handler = arc.http.async(async (request) => {
	return {
		html: /*html*/ `
<html>
	<head>
		<title>img-lqip</title>
		<style>
			html {
				font-size: 16px;
				--space: 1rem;
			}
			body {
				font-family: sans-serif;
				width: calc(${viewWidth * 2}px + var(--space));
				margin: 0 auto;
				padding: var(--space) 0;
				display: flex;
				flex-direction: column;
				gap: var(--space);
			}
			body > * {
				margin: 0;
			}
			main {
				display: flex;
				flex-direction: row;
				gap: var(--space);
			}
			aside {
				width: ${viewWidth}px;
			}
			aside > * {
				display: block;
				margin: 0 auto var(--space) auto;
			}
			pre {
				word-wrap: break-word;
				white-space: pre-wrap;
			}

			img.has-placeholder {
				position: relative;
				z-index: 2;
			}
			.placeholder {
				position: relative;
				width: ${viewWidth}px;
				height: ${imgHeight}px;
				margin-top: calc((${imgHeight}px + var(--space)) * -1);
				background: no-repeat center center;
				background-image: url('${uri}');
				background-size: cover;
				z-index: 1;
			}
			.placeholder::after {
				content: "";
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				width: 100%;
				backdrop-filter: blur(10px);
			}
		</style>
	</head>
	<body>
		<h1>Low Quality Image Placeholders</h1>
		<p>Test on low quality connection</p>
		<main>
			<aside>
				<h2>wasm-vips script (realtime)</h2>

				<h3>Example:</h3>
				<img class="has-placeholder" width=${viewWidth} height=${imgHeight} src="/_static/tbeseda.jpg" />
				<div class="placeholder"></div>

				<h3>Thumbnail:</h3>
				<img width=${thumbnailWidth} height=${thumbnailHeight} src="${uri}" />

				<h3>Thumbnail scaled up:</h3>
				<img width=${viewWidth} src="${uri}" />

				<h3>Thumbnail scaled up + CSS blur:</h3>
				<img width=${viewWidth} src="${uri}" />
				<div class="placeholder"></div>

				<p>
					<mark>${uriSize} bytes</mark> ${uriSize < _uriSize ? "🎉" : "😔"}
					<pre>${uri}</pre>
				</p>
			</aside>

			<aside>
				<h2>lqip-modern (pre-rendered)</h2>

				<h3>&nbsp;</h3>
				<img class="has-placeholder" width=${viewWidth} height=${imgHeight} src="/_static/tbeseda.jpg" />
				<div class="placeholder"></div>

				<h3>&nbsp;</h3>
				<img width=${thumbnailWidth} height=${thumbnailHeight} src="${_uri}" />

				<h3>&nbsp;</h3>
				<img width=${viewWidth} src="${_uri}" />

				<h3>&nbsp;</h3>
				<img width=${viewWidth} src="${_uri}" />
				<div class="placeholder"></div>

				<p>
					<mark>${_uriSize} bytes</mark> ${_uriSize < uriSize ? "🎉" : "😔"}
					<pre>${_uri}</pre>
				</p>
			</aside>
		</main>
	</body>
</html>`,
	};
});
