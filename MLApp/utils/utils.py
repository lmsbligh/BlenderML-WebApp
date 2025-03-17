import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import os
def numpy_max_min(image):
    #image = image.cpu().numpy().transpose((1,2,0))
    return ((image - image.min()) / (image.max() - image.min()))

def numpy_max_min_tf(image):
    image = image.cpu().numpy().transpose((1,2,0))
    return ((image - image.min()) / (image.max() - image.min()))

def select_image_dir(dir):
    dir_list = {}
    with os.scandir(dir) as dir_contents:
        for ind, entry in enumerate(dir_contents):
            if entry.is_dir():
                dir_list.update({ind : entry.name})
    selection = int(input(f'Which dir would you like to chose? {dir_list}'))
    selected_dir = dir_list[selection]
    return f"{dir}\\{selected_dir}"

def compare_images(pred_render_imgs, dataset_renders):
    print("running compare_images")
    fig, axes = plt.subplots(len(pred_render_imgs), 2, figsize=(10, 2 * len(pred_render_imgs)))

    for i in range(len(pred_render_imgs)):
        axes[i, 0].imshow(numpy_max_min_tf(dataset_renders[i][0]), aspect='equal')
        axes[i, 0].set_title("X")
        axes[i, 0].axis("off")

        axes[i, 1].imshow(numpy_max_min(pred_render_imgs[i]), aspect='equal')
        axes[i, 1].set_title("Y")
        axes[i, 1].axis("off")
    plt.show()

def load_from_dir(image_dir):
    images = []
    image_paths = os.listdir(image_dir)
    for image_path in image_paths:
        images.append(mpimg.imread(f"{image_dir}\\{image_path}"))
    
    return images
