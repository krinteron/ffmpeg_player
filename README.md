# ffmpeg player  

## Особенности 

* Динамический плейлист с возможностью редактирования на лету 
* Загрузка файлов чанками  
* Превью видео 

## Описание
Приложение разработано для стриминга видео 24/7.  
Текущие настройки позволяют выводить поток через pci карту decklink sdi в реальном времени.  
Работа превью обеспечена формированием HLS плейлистов, поэтому необходимо настроить Nginx.  
Формирование HLS для превью идет параллельно с выводом потока, но имеет задержку от 10 до 30 секунд.
Приложение использует пропатченную библиотеку ffmpeg, скомпилированную с decklink SDK.  
Файлы diff располагаются в папке "ffmpegPatch" в корне проекта.  

## Пример файла конфигурации Nginx
```
server {
  listen       80;
  server_name  _;
  root         /var/www/html;
  location / {
    # Disable cache
    add_header Cache-Control no-cache;

    # CORS setup
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length';

    # allow CORS preflight requests
    if ($request_method = 'OPTIONS') {
      add_header 'Access-Control-Allow-Origin' '*';
      add_header 'Access-Control-Max-Age' 1728000;
      add_header 'Content-Type' 'text/plain charset=UTF-8';
      add_header 'Content-Length' 0;
      return 204;
    }

    types {
      application/vnd.apple.mpegurl m3u8;
      video/mp2t ts;
    }
  }
  # Load configuration files for the default server block.
  include /etc/nginx/default.d/*.conf;
  error_page 404 /404.html;
  location = /404.html {}

  error_page 500 502 503 504 /50x.html;
  location = /50x.html {}
}
```
  
## ffmpeg diffs
  
### File "libavformat/concatdec.c"  
```diff
+#include <string.h>
...
static int open_file(AVFormatContext *avf, unsigned fileno)
{
  ...
+ const char* ext;
+ FILE *current_playlist;
...
+ const char *get_filename_ext(const char *filename) {
+   const char *dot = strrchr(filename, '.');
+   if(!dot || dot == filename) return "";
+   return dot + 1;
+ }
+ ext = get_filename_ext(file->url);
+ if (("%d", strcmp (ext, "txt")) == 0) {
+   current_playlist = fopen("/tmp/ffmpeg-current-playlist.txt", "w");
+   fprintf(current_playlist, "%s", file->url);
+   fclose(current_playlist);
+ }
...
```
  
### File "fftools/ffmpeg.c"  
```diff
+#include <stdint.h>
+#include <stdio.h>
...
static void print_report(int is_last_report, int64_t timer_start, int64_t cur_time)
{
  ...
+ FILE *current_frame;
...
  for (i = 0; i < nb_output_streams; i++) {
    ...
    if (!vid && enc->codec_type == AVMEDIA_TYPE_VIDEO) {
      ...
+     current_frame = fopen("/tmp/ffmpeg-current-frame.txt", "w");
+     fprintf(current_frame, "%5d", frame_number);
+     fclose(current_frame);
...
```

## Пример работы
https://user-images.githubusercontent.com/24290554/144716364-811c116f-e801-4d7b-b0b5-2ed0c39cf084.mp4
