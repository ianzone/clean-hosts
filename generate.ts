const response = await fetch(
  'https://gitee.com/api/v5/gists/hzp8a5rsjygdeuon0k3qt75/comments/?access_token=c88b3a2aaaf8f067d61780676cf5376f',
);
const res = await response.json();
await Bun.write('hosts', res[0].body);
