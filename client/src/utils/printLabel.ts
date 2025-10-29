export const printShippingLabel = async (
  labelUrl: string,
  trackingNumber: string = "Shipping-Label",
  widthIn: number = 4,
  heightIn: number = 6,
  fileType?: string
) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const isPDF =
        labelUrl.toLowerCase().endsWith(".pdf") ||
        fileType?.toLowerCase() === "pdf";

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("Unable to access iframe document.");

      doc.title = trackingNumber;

      const style = doc.createElement("style");
      style.textContent = `
        @page { size: auto; margin: 0; }
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
        .label { width: ${widthIn}in; height: ${heightIn}in; }
        img, object { width: 100%; height: 100%; object-fit: contain; }
      `;
      doc.head.appendChild(style);

      const container = doc.createElement("div");
      container.className = "label";

      if (isPDF) {
        const object = doc.createElement("object");
        object.type = "application/pdf";
        object.data = labelUrl;
        container.appendChild(object);
        doc.body.appendChild(container);

        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            iframe.remove();
            resolve();
          }, 1000);
        }, 1000);
      } else {
        const img = doc.createElement("img");
        img.src = labelUrl;
        container.appendChild(img);
        doc.body.appendChild(container);
        img.onload = () => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            iframe.remove();
            resolve();
          }, 1000);
        };
        img.onerror = reject;
      }
    } catch (err) {
      reject(err);
    }
  });
};

export const printMultipleShippingLabels = async (
  labelUrls: string[],
  trackingNumbers: string[] = [],
  widthIn: number = 4,
  heightIn: number = 6,
  fileType?: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (!labelUrls || labelUrls.length === 0) {
        reject("No label URLs provided.");
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("Unable to access iframe document.");

      doc.title = "Shipping Labels";

      const style = doc.createElement("style");
      style.textContent = `
        @page { size: ${widthIn}in ${heightIn}in; margin: 0; }
        html, body {
          margin: 0;
          padding: 0;
          background: white;
        }
        .label {
          width: ${widthIn}in;
          height: ${heightIn}in;
          page-break-after: always;
          display: block;
          overflow: hidden;
        }
        img, object {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
      `;
      doc.head.appendChild(style);

      // --- Build each label block ---
      labelUrls.forEach((url, i) => {
        const tn = trackingNumbers[i] || `Label-${i + 1}`;
        const isPDF =
          url.toLowerCase().endsWith(".pdf") ||
          fileType?.toLowerCase() === "pdf";

        const container = doc.createElement("div");
        container.className = "label";

        if (isPDF) {
          const object = doc.createElement("object");
          object.type = "application/pdf";
          object.data = url;
          object.setAttribute("aria-label", tn);
          container.appendChild(object);
        } else {
          const img = doc.createElement("img");
          img.src = url;
          img.alt = tn;
          container.appendChild(img);
        }

        doc.body.appendChild(container);
      });

      // --- Wait for all images to load before printing ---
      const waitForImages = () =>
        Promise.all(
          Array.from(doc.images).map(
            (img) =>
              new Promise<void>((res, rej) => {
                if (img.complete) res();
                else {
                  img.onload = () => res();
                  img.onerror = () => rej(new Error(`Failed to load ${img.src}`));
                }
              })
          )
        );

      waitForImages()
        .then(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            iframe.remove();
            resolve();
          }, 1500);
        })
        .catch((err) => {
          iframe.remove();
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};
