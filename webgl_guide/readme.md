# webgl文档说明

## 深度检查(depth test)
1. 作用和原理

    当启用深度检测的时候，WebGL会将深度信息（深度信息位于Z轴方向，所以也叫Z-Buffer）写入深度缓冲区，在绘制阶段便会根据缓冲区深度信息大小来决定物体的某个部分是否需要画出来。深度值小则距离眼睛近，深度值大则距离眼睛远。在深度检测过程中，物体被遮挡的部分通常是检测失败的，因此也就无需绘制出来，进而实现了前面物体遮挡后面物体的效果
2. 用法
```
// 1. 开启深度检查
gl.enable(gl.DEPTH_TEST);

// 2. 调用方法gl.depthFunc指定深度检测的参数
gl.NEVER （总不通过）
gl.LESS（如果新值小于缓冲区中的值则通过）
gl.EQUAL（如果新值等于缓冲区中的值则通过）
gl.LEQUAL（如果新值小于等于缓冲区中的值则通过）
gl.GREATER（如果新值大于缓冲区中的值则通过）
gl.NOTEQUAL（如果新值不等于缓冲区中的值则通过）
gl.GEQUAL（如果新值大于等于缓冲区中的值则通过）
gl.ALWAYS（总通过）
```
