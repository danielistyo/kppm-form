<template>
  <div class="file-uploader">
    <file-upload
      ref="fileUpload"
      :class="`file-upload${randId} ${hideHeader ? 'hide-header' : ''}`"
      chooseLabel="Pilih"
      cancelLabel="Batal"
      accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
      :showUploadButton="false"
      multiple
      customUpload
      auto
      :disabled="disabled"
      @uploader="handleUpload"
    />

    <progress-spinner v-if="isLoading" class="file-uploader__loading" />
  </div>
</template>

<script lang="ts">
/* 
  TODO: rewrite component. create new component
 */
import { defineComponent, nextTick, PropType, ref, toRef, unref, watch } from 'vue';
import FileUpload from 'primevue/fileupload';
import { getNameFromImageUrl, isUrlImage, resizeImg } from '@/helpers/image';
import firebase from 'firebase/app';
import dayjs from 'dayjs';
import ProgressSpinner from 'primevue/progressspinner';

export default defineComponent({
  name: 'FileUploader',
  components: {
    FileUpload,
    ProgressSpinner,
  },
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const randId = ref(Math.floor(Math.random() * (100 - 1 + 1) + 1));
    const uploadRef = firebase
      .storage()
      .ref()
      .child('uploads/');
    const isLoading = ref(false);
    const fileUpload = ref<null | { files: Array<string> }>(null);

    // create image element in FileUploader when there is initial value
    watch(
      toRef(props, 'modelValue'),
      (modelValue) => {
        // start to handle selected files
        if (Array.isArray(modelValue) && modelValue.length) {
          const buttonRemoveClickHandler = async (e: any) => {
            isLoading.value = true;
            const nameFile: string | null =
              e.target.getAttribute('data-name') ||
              e.target.parentElement.getAttribute('data-name') ||
              '';

            if (nameFile) {
              emit(
                'update:modelValue',
                modelValue.filter((url) => !url.includes(nameFile)),
              );
              document.getElementById(`existingImage${nameFile}`)?.remove();
              isLoading.value = false;
            }
          };
          const getSelectedFileTemplate = (src: string) => {
            const filename = getNameFromImageUrl(src);
            const isImage = isUrlImage(filename);
            return `
              <div id="existingImage${filename}" class="p-fileupload-row">
                <div class="p-text-center">
                  ${
                    isImage
                      ? `<a href="${src}" target="_blank"><img role="presentation" alt="${filename}" width="50" src="${src}"/></a>`
                      : '<span class="pi pi-file" style="font-size:18px"></span>'
                  } 
                </div> 
                <div><a href="${src}" target="_blank">${filename}</a></div>
                <div></div>
                <div>
                  <button
                    class="p-button p-component p-button-icon-only existing-image-remove-button"
                    ${props.disabled ? 'disabled="true"' : ''}
                    type="button"
                    data-name="${filename}"
                  >
                    <span class="pi pi-times p-button-icon"></span>
                    <span class="p-button-label">&nbsp;</span>
                  </button>
                </div>
              </div>
              `;
          };
          nextTick(() => {
            const wrapperSelectedFile = document.querySelector('.p-fileupload-content');

            // remove all children first
            if (wrapperSelectedFile) {
              const childrenLength = wrapperSelectedFile.children.length;
              for (let i = 0; i < childrenLength; i++) {
                // always remove first item
                wrapperSelectedFile.children?.item(0)?.remove();
              }
            }
            // then add all children
            modelValue.forEach((url) => {
              //  afterbegin will add element first to children
              wrapperSelectedFile?.insertAdjacentHTML('afterbegin', getSelectedFileTemplate(url));

              // then it will give event listener to first element which is element that we just added above
              document
                .querySelector('.existing-image-remove-button')
                ?.addEventListener('click', buttonRemoveClickHandler);
            });
          });
        }
      },
      { immediate: true },
    );

    const handleUpload = async ({ files }: { files: Array<File & { objectURL: Blob }> }) => {
      // Clear files data of FileUpload component,
      // then all selected files will be clear.
      // This is hacked of FileUpload component.
      // Because we will handle selected file by our selves
      if (fileUpload.value) fileUpload.value.files = [];

      isLoading.value = true;
      // get last image only
      const file = files[files.length - 1];
      const arrNames = file.name.split('.');
      const fileType = arrNames[arrNames.length - 1];
      const nameFile = dayjs().unix() + '.' + fileType;
      const fileRef = uploadRef.child(nameFile);

      let blob: Blob | null = null;
      if (isUrlImage(`.${fileType}`)) {
        // resize image first
        blob = file.size > 500000 ? await resizeImg(file) : new Blob([file], { type: file.type });
      } else {
        blob = new Blob([file], { type: file.type });
      }

      // upload image
      await fileRef.put(blob);
      const url = await fileRef.getDownloadURL();

      emit('update:modelValue', [...props.modelValue, url]);

      // set data name to remove button. It will be used to remove image on firebase when remove button is clicked
      nextTick(() => {
        let newRemoveButton = document?.querySelector(
          `.file-upload${unref(randId)} .p-fileupload-files > :last-child button`,
        );

        newRemoveButton?.setAttribute('data-name', nameFile);
        newRemoveButton?.addEventListener('click', async (e: any) => {
          isLoading.value = true;
          const nameFile: string | null =
            e.target.getAttribute('data-name') ||
            e.target.parentElement.getAttribute('data-name') ||
            '';

          if (nameFile) {
            await uploadRef.child(nameFile).delete();

            emit(
              'update:modelValue',
              props.modelValue.filter((url) => !url.includes(nameFile)),
            );
            isLoading.value = false;
          }
          // remove reference so that garbage collector can clear in memory
          newRemoveButton = null;
        });
      });
      isLoading.value = false;
    };

    const handleClear = async () => {
      isLoading.value = true;
      let newRemoveButtons: NodeListOf<Element> | null = document?.querySelectorAll(
        `.file-upload${unref(randId)} .p-fileupload-files button`,
      );
      await new Promise((resolve) => {
        newRemoveButtons?.forEach(async (button, key) => {
          const nameFile: string | null =
            button?.getAttribute('data-name') ||
            button?.parentElement?.getAttribute('data-name') ||
            '';

          if (nameFile) {
            await uploadRef.child(nameFile).delete();
          }

          // loop reachs last key
          if (newRemoveButtons && key === newRemoveButtons.length - 1) {
            resolve(null);
          }
        });
      });
      // remove reference so that garbage collector can clear in memory
      newRemoveButtons = null;
      emit('update:modelValue', []);
      isLoading.value = false;
    };

    return { handleUpload, handleClear, randId, isLoading, fileUpload };
  },
});
</script>

<style lang="scss" src="./FileUploader.scss" scoped />
