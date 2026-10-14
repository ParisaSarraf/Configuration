import { Button, Image, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

const FileUploader = ({ value = [], onChange, maxFiles = 1, documentState, documentFileAccess }) => {
  const [fileList, setFileList] = useState([]);

  const normalizedValue = useMemo(() => {
    return Array.isArray(value) ? value : [];
  }, [JSON.stringify(value)]);

  useEffect(() => {
    if (JSON.stringify(fileList) !== JSON.stringify(normalizedValue)) {
      setFileList(normalizedValue);
    }
  }, [normalizedValue]);

  const handleChange = async (info) => {
    const updatedFileList = info.fileList.slice(0, maxFiles);

    const processedFiles = await Promise.all(
      updatedFileList.map(async (file) => {
        if (file.url || file.base64) return file;
        if (file.originFileObj) {
          return {
            ...file,
            base64: await toBase64(file.originFileObj),
          };
        }
        return file;
      })
    );

    setFileList(processedFiles);
    onChange?.(processedFiles);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const isRestricted = (file) => Boolean(file.url) && (documentFileAccess !== undefined || documentState !== undefined) && documentFileAccess !== true;

  const handlePreview = async (file) => {
    if (isRestricted(file)) return; 

    if (file.url) {
      window.open(file.url, "_blank");
    } else if (file.base64) {
      window.open(file.base64, "_blank");
    } else if (file.originFileObj) {
      const base64 = await toBase64(file.originFileObj);
      window.open(base64, "_blank");
    }
  };

  return (
    <div>
      <Upload
        accept="*/*"
        listType="picture"
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        beforeUpload={() => false}
        itemRender={(originNode, file, _list, actions) => isRestricted(file) ? (
          <div style={{ padding: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <bdi>{file.name}</bdi>
            <Button style={{ minHeight: 44 }} onClick={actions.remove}>حذف از فهرست</Button>
          </div>
        ) : originNode}
      >
        {fileList.length < maxFiles && (
          <Button icon={<UploadOutlined />}>آپلود فایل</Button>
        )}
      </Upload>
      {fileList.map((file, index) => (
        <div key={index}>
          {(file.url || file.base64) && !isRestricted(file) && (
            <Image
              key={index}
              src={file.url || file.base64}
              width={100}
              style={{ marginTop: 10 }}
              preview={{ src: file.url || file.base64 }}
            />
          )}
          {isRestricted(file) && (
            <div style={{ marginTop: 10, color: "#64748b" }}>
              شما اجازه مشاهده این فایل را ندارید
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileUploader;