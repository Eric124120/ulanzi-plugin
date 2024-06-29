{
  "targets": [
    {
      # 全局唯一的目标文件名称。本例编译生成cal.node
      "target_name": "zoom",
      # C++源文件
      "sources": [
          "./cpp/zoom.cc",
      ],
      # C++头文件目录
      "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      # 静态库
      "libraries": [],
      "msvs_settings": {
          "VCCLCompilerTool": { "ExceptionHandling": 1 },
      },
      # 预编译宏，禁用Node-API的C++异常处理和node-addon-api废弃的API
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS", "NODE_ADDON_API_DISABLE_DEPRECATED"]
  }
  ]
}