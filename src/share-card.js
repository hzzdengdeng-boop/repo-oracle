const WIDTH = 1200;
const HEIGHT = 630;

export function downloadCard(result, permalink) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f7f8f6";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#1f7a68";
  ctx.fillRect(0, 0, 16, HEIGHT);
  ctx.fillStyle = "#d55c3f";
  ctx.fillRect(16, 0, 5, HEIGHT);

  ctx.textBaseline = "top";
  ctx.fillStyle = "#1f7a68";
  ctx.font = "bold 25px system-ui, sans-serif";
  ctx.fillText("REPO ORACLE", 72, 55);
  ctx.fillStyle = "#666a73";
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillText("A fortune for your GitHub repo", 72, 95);

  ctx.fillStyle = "#171717";
  ctx.font = "bold 37px system-ui, sans-serif";
  const title = fitText(ctx, result.title, 850);
  ctx.fillText(title, 72, 161);

  ctx.fillStyle = "#1f7a68";
  ctx.font = "bold 114px system-ui, sans-serif";
  ctx.fillText(String(result.score), 72, 222);
  ctx.fillStyle = "#666a73";
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.fillText("STAR POTENTIAL / 100", 255, 301);

  ctx.fillStyle = "#e0e4df";
  ctx.fillRect(72, 367, 1056, 10);
  ctx.fillStyle = "#1f7a68";
  ctx.fillRect(72, 367, 1056 * result.score / 100, 10);

  ctx.fillStyle = "#d55c3f";
  ctx.font = "bold 19px system-ui, sans-serif";
  ctx.fillText("THE VERDICT", 72, 407);
  ctx.fillStyle = "#171717";
  ctx.font = "bold 30px system-ui, sans-serif";
  const verdict = wrapText(ctx, `${result.personality}.`, 1056, 2);
  verdict.forEach((line, index) => ctx.fillText(line, 72, 443 + index * 38));

  ctx.fillStyle = "#666a73";
  ctx.font = "20px system-ui, sans-serif";
  const invitation = "Get your own reading:";
  const linkX = 72 + ctx.measureText(invitation).width + 16;
  ctx.fillText(invitation, 72, 577);
  ctx.fillStyle = "#1f7a68";
  ctx.font = "bold 20px system-ui, sans-serif";
  const link = shortLink(permalink);
  ctx.fillText(fitText(ctx, link, 1128 - linkX), linkX, 577);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `repo-oracle-${result.title.replaceAll("/", "-")}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

function fitText(ctx, text, width) {
  if (ctx.measureText(text).width <= width) return text;
  let end = text.length;
  while (end > 1 && ctx.measureText(`${text.slice(0, end)}...`).width > width) end -= 1;
  return `${text.slice(0, end)}...`;
}

function wrapText(ctx, text, width, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= width) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines[maxLines - 1] = fitText(ctx, lines.slice(maxLines - 1).join(" "), width);
  }
  return lines.slice(0, maxLines);
}

function shortLink(permalink) {
  const url = new URL(permalink);
  if (url.protocol === "file:" || ["localhost", "127.0.0.1"].includes(url.hostname)) {
    return "github.com/hzzdengdeng-boop/repo-oracle";
  }
  return `${url.host}${url.pathname}`;
}
