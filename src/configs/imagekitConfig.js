// configs/imagekitConfig.js
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Custom method to delete a file by its path
imagekit.deleteFileByPath = async (filePath) => {
  try {
    console.log("filePath", filePath)
    console.log("path",filePath.split('/').slice(0, -1).join('/'))
    console.log("searchQuery",`name:"${filePath.split('/').pop()}"`)
    const files = await imagekit.listFiles({
      path: filePath.split('/').slice(0, -1).join('/'),
      searchQuery: `name:"${filePath.split('/').pop()}"`,
    });

    console.log("files", files)

    if (files.length === 0) {
      throw new Error('File not found');
    }

    const fileId = files[0].fileId;
    await imagekit.deleteFile(fileId);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

export default imagekit;